/** @module lib/socket
    @description socket utilities
*/
require('when/monitor/console');


var _            = require('lodash')
, when           = require('when')
, gen            = require('when/generator')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, arrayEqual     = require('./stats').arrayEqual
, logger         = require('../logger').socLogger
, appLogger      = require('../logger').appLogger
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

  /*
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

  function getStats(questionIds, sessionId) {
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
  var goto = gen.lift(function *gotoGen(socket, evt) {
    try{
      var session = yield Session.findOne({_id: socket.request.sessionId}).exec();

      // TODO load adapter based on presentation type
      var adapter = require('../presentationAdapter/adapters').impress;
      var nextSlide = adapter.getSlideFromGotoData(evt.data);

      if (nextSlide == null){
        appLogger.debug("lib.uitls.socket:goto nextSlide is null")
        //drop event
        return;
      }

      var results = yield when.all([
          session.questionsForSlide(nextSlide),
          session.statQuestionsForSlide(nextSlide)
      ]);

      session.activeSlide = nextSlide;
      session.activeQuestions = results[0];
      session.activeStatsQuestions = results[1];

      if (!! session.activeStatsQuestions.length) {
        evt.stats  = yield getStats(session.activeStatsQuestions, session._id);
      }

      //save does not return a promise
      yield nodefn.lift(session.save.bind(session))();
      notifyNamespaces('asq:goto', evt, session._id, 'ctrl', 'folo', 'wtap');

      // session.save(function(err) {
      //   notifyNamespaces('asq:goto', evt, session._id, 'ctrl', 'folo', 'wtap');
      //   if (err) { throw err; }
      // });
    }catch(err) {
      logger.error('On goto: ' + err.message, {err: err.stack});
    };
  });

  var submit = gen.lift(function *subitGen(socket, evt) {
    try{
      logger.debug('Submission');
      if (!evt.exercise || !evt.exercise.id) {
        logger.error(new Error('Invalid Submission: Missing or invalid exercise.'));
        return;
      }
      // Notify the sender
      socket.emit('asq:submitted', {
        exercise : evt.exercise.id,
        status   : 'processing'
      });

      var token = socket.request.token;
      var session = yield Session.findOne({_id: socket.request.sessionId}).exec();

      //save does not return a promise
      var liftedSave = nodefn.lift(submission.answer.save.bind(submission.answer));
      var data = yield liftedSave(session, token, evt.exercise);

      var exercise  = data[0];
      var questions = data[1];
      var answers   = data[2];
      var progress  = data[3];
      var self      = data[4];
      var peer      = data[5];

      sendProgress(progress, session.id);

      socket.emit('asq:submitted', {
        exercise : exercise.id,
        resubmit : exercise.allowResubmit,
        status   : 'success',
        type     : 'answer'
      });

      // Handle peer assessment
      if (self || peer) { // Add answers for peers
        // in the case of assessment -> add the answer to the queue
        var jobs = yield enqueueAnswersForAssessment(session._id, exercise, answers, token);
        var job = yield assessment.job.getNextAssessmentJob(session._id, exercise, token);
        job = assessment.job.activateJob(job);
        var html = yield assessment.render(job);

        if (!! html) {
          logger.info('Sending assessment to ' + socket.id);
          socket.emit('asq:assess', { html: html, exercise: exercise.id });
        }
        // notify ctrl of the assessment
        notifyCtrlForNewJobs([job]);

        var newJobs = yield assessment.job.getNextJobForIdleViewers(session._id, exercise); 
        var JobSocketsPairs = yield getSocketsForJobs(newJobs);
        JobSocketsPairs = yield activateJobsForSockets(JobSocketsPairs);
        var HtmlSocketsPairs = renderJobsForSockets(JobSocketsPairs);
        sendHtmlForSockets(HtmlSocketsPairs, exercise.id);
        notifyCtrlForNewJobs( newJobs);
      }
    }catch(err){
      logger.error(err.message, { err: err.stack });
    } 
  });

  var assessed = gen.lift(function *assessedGen(socket, evt) {
    logger.debug('Assessment');
    try{
      if (!evt.assessment) {
        logger.error(new Error('Invalid Submission: Missing or invalid exercise.'));
        return;
      }
      if (!evt.assessment.exercise) {
        logger.error(new Error('Invalid or missing exercise reference.'));
      }

      var assessee = evt.assessment.assessee;
      var assessor = socket.request.token;
      var session = yield Session.findOne({_id: socket.request.sessionId}).exec();
      var exercise = yield Exercise.findById(evt.assessment.exercise).exec();

      //save does not return a promise
      var liftedSave = nodefn.lift( assessment.save.bind( assessment));
      var assessments = yield liftedSave(session, evt.assessment, assessor);
      var progress =  yield assessment.job
        .terminateJobsAndUpdateProgress(session, exercise._id, assessor, assessee);

      progress = progress.toObject(); // Convert to object to add audience.
      // Add audience size to progress.
      // progress.audience = io.of('/folo').clients(progress.session).length;
      progress.audience = getNumOfConnectedClients('/folo', progress.session)

      var score=0;
      for (var i = assessments.length - 1; i >= 0; i--) {
        score += assessments[i].score;
      };

      score = ~~(score/assessments.length);
      //notify ctrl for the assessment
      var assessEvt={
        exerciseId : exercise._id,
        assessor: {token: assessor},
        assessee: {token: assessee},
        score: score
      }
      notifyNamespaces('asq:assess', assessEvt, session._id, 'ctrl');

      // Send updated progress to ctrl
      notifyNamespaces('asq:submitted', { progress: progress },
        progress.session, 'ctrl');

      socket.emit('asq:submitted', {
        exercise : exercise.id,
        resubmit : false,
        status   : 'success',
        type     : 'assessment'
      });

      var job = yield assessment.job.getNextAssessmentJob(progress.session, exercise, assessor);
      var jobEvt = {
          exerciseId: exercise._id,
          assessor: {token:job.assessor},
          assessee: {token:job.assessee}
        };

      notifyNamespaces('asq:new-assessment-job', jobEvt, session._id, 'ctrl');
      var html = yield assessment.render(job);
      if (html) {
        socket.emit('asq:assess', { html: html, exercise: exercise.id });
      }
    }catch(err){
      logger.error(err.message, { err: err.stack });
    }
  });

  var terminate = function(socket, evt) {
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

  function deleteAndNotify(socket, sid, userInfo, namespace, toNotify) {
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

  var ctrlConnect = function(socket) {
    var screenName = socket.request.screenName;
    var sessionId = socket.request.sessionId;
    var evt       = { screenName : screenName };

    ioConnect(socket, 'ctrl');
    notifyNamespaces('asq:ctrl-connected', evt, sessionId,
        'ctrl', 'wtap', 'folo');

    // TODO: check if sendConnectedClients call is needed
    //sendConnectedClients(sessionId, null, null, 'ctrl');
    sendProgresses(sessionId);
  };

  var ctrlDisconnect = function(socket) {
    logger.info('CTRL Disconnect');
    var sid = socket.request.sessionId;
    getTokenAndScreenName(socket)
    .then(
      function delAndNotify(userInfo) {
        return deleteAndNotify(socket, sid, userInfo, 'ctrl', 'ctrl', 'folo', 'wtap');
      },
      function ctrlDisconnectErr(err) {
        logger.error('Failed to disconnect client from \'ctrl\':\n\t' +
          err.toString(), { err: err.stack });
    });
  };

  var foloConnect = function(socket) {
    var screenName = socket.request.screenName;
    var sessionId  = socket.request.sessionId;
    var token      = socket.request.token;

    ioConnect(socket, 'folo');

    sendConnectedClients(sessionId, token, screenName, 'ctrl', 'wtap', 'folo');

    return nodefn.call(client.lpush.bind(client), token.toString(), socket.id).then(
      function onPush() {
        logger.info('[Redis] saved socket id');
        return submission.progress.updateConnect(sessionId, token);
    }).then(
      function notifyProgress(progresses) {
        return sendProgresses(sessionId); //Return updates to progress bars to ctrl on folo conn.
    }).then(function completeAnswers(progresses) {
      return sendSubmissions(socket, sessionId, token);
    }).then(function getActiveJob(ex) {
      return AssessmentJob.find({
        assessor : token,
        status   : 'active',
        session  : sessionId,
      }).exec();
    }).then(function getExercises(jobs) {
      var exerciseIds = jobs.map(function(job) { return job.exercise });
      return when.join(jobs, Answer.distinct('exercise', {
        answeree : token,
        session  : sessionId,
        exercise : {$nin: exerciseIds }
      }).exec());
    }).then(
      function getExercises(data) {
        var jobs = data[0];
        var exerciseIds = data[1];
        return when.join(jobs,
          Exercise.find({ _id: {$in: exerciseIds} }).exec());
    }).then(
      function getNextJobs(data) {
        var jobs = data[0];
        var exercises = data[1];
        return when.join(jobs, when.map(exercises, function getNextJob(ex) {
          return assessment.job.getNextAssessmentJob(sessionId, ex, token);
        }));
    }).then(
      function activateIdleJobs(jobs) {
        jobs = _.remove(_.flatten(jobs), function(j) { return j !== null});
        notifyCtrlForNewJobs(jobs);
        return when.map(jobs,
          function(j) { return assessment.job.activateJob(j); });
    }).then(
      function renderJobs(jobs) {
        return when.join(jobs,
          when.map(jobs, function(j) { return assessment.render(j); }));
    }).then(
      function sendHtmls(jobsAndHtml) {
        var jobs = jobsAndHtml[0];
        var htmls = jobsAndHtml[1];
        var i = Math.min(jobs.length, htmls.length);
        while(i--) {
          if (!! jobs[i] && !! htmls[i]) {
            socket.emit('asq:assess', {
              exercise : jobs[i]. exercise, html : htmls[i] });
          }
        }
    }).catch(function(err){
      throw err;
    });
  };

  var foloDisconnect = function(socket) {
    var sid = socket.request.sessionId;
    var userInfo;

    getTokenAndScreenName(socket)
    .then(
      function(userInfo) {
        return nodefn.call(
          client.lrem.bind(client), userInfo.token.toString(), 0, socket.id).then(
            function onRemove() {
              logger.info('[Redis] Removed socket id');
              return when.resolve(data); });
    }).then(
      function delAndNotify(data) {
      return deleteAndNotify(socket, sid, userInfo, 'folo', 'ctrl', 'folo', 'wtap');
    }).then(
    function updateProgresses(data) {
      return submission.progress.updateDisconnect(sid, userInfo.token);
    }).then(
    function notifyProgress(data) {
      var i = data.length, progress;
      while(i--) {
        progress = data[i].toObject();
        // progress.audience = io.of('/folo').clients(progress.session).length;
        progress.audience = getNumOfConnectedClients('/folo', progress.session)
        notifyNamespaces('asq:submitted', { progress: progress },
          progress.session, 'ctrl');
      }
    },
    function foloDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'folo\':\n\t' +
        err.toString(), { err: err.stack });
    });
  };

  var wtapConnect = function(socket) {
    ioConnect(socket, 'wtap');
  };

  var wtapDisconnect = function(socket) {
    var sid = socket.request.sessionId;

    deleteAndNotify(socket, sid, 'Wtap client', 'wtap', 'ctrl')
    .then(
    function wtapDisconnectSuccess(){
      logger.info('Wtap disconnected');
    },
    function wtapDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'wtap\':\n\t' +
        err.toString());
    });
  };

  var statConnect = function(socket) {
    ioConnect(socket, 'stat');
  };

  var statDisconnect = function(socket) {
    var sid = socket.request.sessionId
      deleteAndNotify(socket, sid, 'Stat client', 'stat', 'ctrl')
    .then(
    function statDisconnectSuccess(){
      logger.info('Stat disconnected');
    },
    function statDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'stat\':\n\t' +
        err.toString());
    });
  };

  var sendProgress = function(progress, sessionId) {
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

  var sendProgresses = function(sessionId) {
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

  var enqueueAnswersForAssessment = function(sessionId, exercise, answers, token) {
    return assessment.job.enqueue(sessionId, exercise,
      Object.keys(answers).map(function getAnswerDoc(i) {
        return answers[i];
    }));
  }

  var getSocketsForJobs = function(jobs) {
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

  var activateJobsForSockets = function (JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.job.activateJob(pair[1]));
    });
  }

  var renderJobsForSockets = function(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.render(pair[1]));
    });
  }

  var sendHtmlForSockets = function(HtmlSocketsPairs, exerciseId) {
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

  function getNumOfConnectedClients(namespace, room){
    var num=0;
    try{
       num = Object.keys(io.nsps[namespace].adapter.rooms[room]).length;
    }catch( err){
      appLogger.error(err.toString() + err.stack);
      num = 0;
    }finally{
      return num;
    }
  }
 

  var sendConnectedClients = function(sessionId, token, screenName, namespaces) {
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

  var sendSubmissions = function(socket, sessionId, token) {
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

  return {
    goto           : goto,
    submit         : submit,
    foloAssess     : assessed,
    ctrlConnect    : ctrlConnect,
    ctrlDisconnect : ctrlDisconnect,
    foloConnect    : foloConnect,
    foloDisconnect : foloDisconnect,
    wtapConnect    : wtapConnect,
    wtapDisconnect : wtapDisconnect,
    statConnect    : statConnect,
    statDisconnect : statDisconnect,
    terminate      : terminate
  }
}
