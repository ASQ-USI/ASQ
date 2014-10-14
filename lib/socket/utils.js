/** @module lib/socket/utils
    @description socket utilities
*/
require('when/monitor/console');


var _            = require('lodash')
, when           = require('when')
, gen            = require('when/generator')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, arrayEqual     = require('../stats').arrayEqual
, logger         = require('../logger').socLogger
, appLogger      = require('../logger').appLogger
, flow           = require('../flow')
, assessment     = require('../assessment')
, submission     = require('../submission')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')
, Assessment     = db.model('Assessment')
, AssessmentJob  = db.model('AssessmentJob')
, Exercise       = db.model('Exercise')
, Question       = db.model('Question')
, Session        = db.model('Session')
, User           = db.model('User')
, WhitelistEntry = db.model('WhitelistEntry');

module.exports =  function(io, client){

  /**
   *  Get the dislayName stored with a socket.
   *  This function was rewritten to support a promise.
   */
  var getTokenAndScreenName = gen.lift(function *getTokenAndScreenName(socket, callback) {
    var returnData = {};
    try{
      var token = socket.request.token;
      if (!token) {
        return when.reject(new Error('Unable to retrieve token.'));
      }
      returnData.token = token;

      var entry = yield WhitelistEntry.findOne({ _id : token }, 'screenName').exec();
      if (!entry || !entry.screenName) {
        throw (new Error('Screen name not found for ' + token + '.'));
      }

      returnData.screenName = entry.screenName;
    }catch(err){
      if (callback && typeof callback === 'function') {
        callback(err, null);
        return;
      } else {
        return when.reject(err);
      }
    }
    
    if (callback && typeof callback === 'function') {
      callback(null, returnData);
    }
    return returnData;
  });

  var getStats = function(questionIds, sessionId) {
    var deferred = when.defer();
    Question.find({_id: {$in: questionIds }}).exec()
    .then(
      function onQuestions(questions) {
        if (! questions) {
          deferred.resolve(null); //No questions means no stats
        }
        var o = {};
        for (var i = questions.length; i--;) {
          o[questions[i]._id] = questions[i].getStats(sessionId);
        }
        return wkeys.all(o);
    }).then(
      function onStats(stats) {
        deferred.resolve(stats);
    },function onError(err) {
        deferred.reject(err);
    });
    return deferred.promise;
  }

  var notifyNamespaces = function(eventName, evt, sessionId, namespaces) {
    if (arguments.length < 4) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 3);
    for (var i=0; i<args.length; i++) {
      io.of('/' + args[i]).in(sessionId).emit(eventName, evt);
    }
  };

  /*
   *  Emit an event to the ctrl, folo & wtap namespaces to go to a specific slide.
   */
    
  var terminate = function terminate(socket, evt) {
    var sid = socket.request.sessionId;
   
    Session.findByIdAndUpdate(sid, { endDate : newDate }).exec()
    .then(
      function updateUser(session) {
        return User.findByIdAndUpdate(session.presenter, {
          current : null
        }).exec();
      }).then (
      function notifyTerminated(user) {
        notifyNamespaces('asq:session-terminated', {}, sid,
          'ctrl', 'folo', 'wtap', 'stat');
      }, function onError(err) {
        logger.error('Error on terminate session:\n\t' + err.toString());
      });
  };

  var deleteAndNotify = function deleteAndNotify(socket, sid, userInfo, namespace, toNotify) {
    var args       = Array.prototype.slice.call(arguments, 3);
    var screenName = userInfo.screenName;
    var eventName  = 'asq:' + namespace + '-disconnected';
    var evt        = { screenName : screenName };

    delete socket.request.session ;  
    delete socket.request.token;      
    delete socket.request.screenName; 

    logger.info('Removed ' + screenName + ' (token) on disconnect (' +
      screenName +')');

    logger.info('Removed ' + sid + ' (session id) on disconnect (' +
      screenName +')');
      
    socket.leave(sid);

    notifyNamespaces(eventName, evt, sid, args);
    logger.info('[' + namespace.toUpperCase() + '] ' +
      screenName + ' disconnected');
    return when.resolve(true);
  }

  var ioConnect = gen.lift(function *ioConnectGen(socket, namespace) {

    var session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id);

    var evt = { slide: session.activeSlide };
    if (!! session.activeStatsQuestions.length) {
      var stats = yield getStats(session.activeStatsQuestions, session._id)
      if (!! stats) {
        evt.stats = stats;
      }
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    } else {
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    }
  });

  var sendProgress = function sendProgress(progress, sessionId) {
    // Convert mongoose document to object
    if (progress instanceof AnswerProgress) {
      progress = progress.toObject();
    }
    // Add audience size to progress.
    // progress.audience = io.of('/folo').clients(sessionId).length;
    progress.audience = getNumOfConnectedClients('/folo', progress.session)

    // Send updated progress to ctrl
    notifyNamespaces('asq:submitted', { progress: progress },
      progress.session, 'ctrl');

    var defer = when.defer()
    process.nextTick(function resolve() { defer.resolve(progress); });
    return defer.promise;
  }

  var sendProgresses = function sendProgresses(sessionId) {
    AnswerProgress.find({session: sessionId}).lean().exec().then(
      function onProgressess(progresses) {
        if(progresses instanceof Array) {
          return when.map(progresses, function handleProgress(progress) {
            return sendProgress(progress, sessionId)
          });
        }
        var defer = when.defer()
        process.nextTick(function resolve() { defer.resolve(null); });
        return defer.promise;
    });
  }

  var enqueueAnswersForAssessment = function enqueueAnswersForAssessment(sessionId, exercise, answers, token) {
    return assessment.job.enqueue(sessionId, exercise,
      Object.keys(answers).map(function getAnswerDoc(i) {
        return answers[i];
    }));
  }

  var getSocketsForJobs = function getSocketsForJobs(jobs) {
    var pairs = [];
    var i = jobs.length;
    while(i--){
      pairs.push(when.join(
        nodefn.call(client.lrange.bind(client), jobs[i].assessor.toString(), 0, -1),
        jobs[i])
      );
    }
    return when.all(pairs);
  }

  var activateJobsForSockets = function activateJobsForSockets(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.job.activateJob(pair[1]));
    });
  }

  var renderJobsForSockets = function renderJobsForSockets(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.render(pair[1]));
    });
  }

  var sendHtmlForSockets = function sendHtmlForSockets(HtmlSocketsPairs, exerciseId) {
    var j, pair, html, sockets;
    var i = HtmlSocketsPairs.length;
    while(i--) {
      pair = HtmlSocketsPairs[i];
      sockets = pair[0];
      html = pair[1];
      if (!! html) {
        j = sockets.length;
        while(j--) {
          logger.info('Sending assessment to idle viewer ' + sockets[j])
          io.of('/folo').socket(sockets[j]).emit('asq:assess',
            { html: html, exercise : exerciseId });
        }
      }
    }
  }

  function notifyCtrlForNewJobs(newJobs){
     newJobs.forEach(function(newJob){
      var jobEvt = {
        exerciseId: newJob.exercise,
        assessor: {token:newJob.assessor},
        assessee: {token:newJob.assessee}
      };
      notifyNamespaces('asq:new-assessment-job', jobEvt, newJob.session, 'ctrl');
    });
  }

  var getNumOfConnectedClients = function getNumOfConnectedClients(namespace, room){
    var num=0;
    try{
      var adapterRoom = io.nsps[namespace].adapter.rooms[room];
      if(adapterRoom !== undefined && adapterRoom !== null)
       num = Object.keys(adapterRoom).length;
    }catch( err){
      appLogger.error(err.toString() + err.stack);
      num = 0;
    }finally{
      return num;
    }
  }
 
  var sendConnectedClients = function sendConnectedClients(sessionId, token, screenName, namespaces) {
    if (arguments.length < 3) { return; }

    // var clients = io.of('/folo').clients(sessionId).length;
    var clients = getNumOfConnectedClients('/folo', sessionId)
    var evt = { connectedClients: clients };
    if (_.isString(screenName)) {
      evt.screenName = screenName;
    }
    evt.token = token;

    var notifyBinded =  notifyNamespaces
      .bind(this, 'asq:folo-connected', evt, sessionId );
    notifyBinded.apply(this, Array.prototype.slice.call(arguments, 3));
  }

  var sendSubmissions = function sendSubmissions(socket, sessionId, token) {
    var defer = when.defer();
    Answer.distinct('exercise', { session : sessionId, answeree : token })
      .exec().then(
        function onExercises(exercises) {
          if (! exercises) {
            defer.resolve(null);
          }
          var i = exercises.length;
          while(i--) {
            socket.emit('asq:submitted',
              { exercise : exercises[i], status: 'confirmation', type: 'answer' });
          }
          defer.resolve(exercises);
        }, function onError(err) { defer.reject(err); }
    );
    return defer.promise;
  }

  var saveConnectionToRedis = function saveConnectionToRedis(token, socket){
    return nodefn.call(client.lpush.bind(client), token.toString(), socket.id)
  }

  var removeConnectionFromRedis = function removeConnectionFromRedis(token, socket){
    return nodefn.call(
        client.lrem.bind(client), token.toString(), 0, socket.id);
  }

  return {
    activateJobsForSockets : activateJobsForSockets,
    deleteAndNotify : deleteAndNotify,
    enqueueAnswersForAssessment : enqueueAnswersForAssessment,
    getTokenAndScreenName : getTokenAndScreenName,
    getStats : getStats,    
    getSocketsForJobs : getSocketsForJobs,
    notifyCtrlForNewJobs : notifyCtrlForNewJobs,
    notifyNamespaces : notifyNamespaces,
    getNumOfConnectedClients : getNumOfConnectedClients,
    renderJobsForSockets : renderJobsForSockets,
    removeConnectionFromRedis : removeConnectionFromRedis,
    saveConnectionToRedis : saveConnectionToRedis,
    sendConnectedClients : sendConnectedClients,
    sendHtmlForSockets : sendHtmlForSockets,
    sendProgress : sendProgress,
    sendProgresses : sendProgress,
    sendSubmissions : sendSubmissions,
    terminate : terminate
  }
}
