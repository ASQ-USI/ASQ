/** @module lib/socket/handlers
    @description handlers for socket events
*/
require('when/monitor/console');


var _            = require('lodash')
, when           = require('when')
, gen            = require('when/generator')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, arrayEqual     = require('../stats').arrayEqual
, stats          = require('../stats/stats')
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
, Slideshow      = db.model('Slideshow')
, User           = db.model('User')
, WhitelistEntry = db.model('WhitelistEntry');

module.exports =  function(socketUtils){

  /*
   *  Emit an event to the ctrl, folo & wtap namespaces to go to a specific slide.
   */
    var goto = function(socket, evt){
      Session.findOne({_id: socket.request.sessionId}, function(err, session){
        if(err){
          logger.error(err.message, { err: err.stack });
        }else{
          try{
            var sessionFlow = flow[session.flow](socketUtils);
            sessionFlow.handleSocketEvent('asq:goto', socket, evt);
          }catch(err){
            logger.error(err.message, { err: err.stack });
          }
        }
      })
    }

  var submit = gen.lift(function *submitGen(socket, evt) {
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

      //TODO : return object instead of an array
      var data = yield submission.answer.save(session, token, evt.exercise);

      var exercise  = data[0];
      var questions = data[1];
      var answers   = data[2];
      var progress  = data[3];
      var self      = data[4];
      var peer      = data[5];

      socketUtils.sendProgress(progress, session.id);

      socket.emit('asq:submitted', {
        exercise : exercise.id,
        resubmit : exercise.allowResubmit,
        status   : 'success',
        type     : 'answer'
      });

      //see if automatic asssemsent was created
      var assessments = yield Assessment.find({
        session: session._id,
        exercise: exercise._id,
        assessee : token,
        type : 'auto'
      }, {'_id': 0,
       'assessee': '1',
       'question': '1',
       'answer' : '1',
       'score': '1', 
       'type': '1',
       'submittedDate' :'1'
     })
      .populate('question answer')
      .exec();

      assessments.forEach(function(assessment){
        socket.emit('asq:assessment', assessment.toObject());
        socketUtils.notifyNamespaces('asq:assessment',assessment.toObject() , session._id, 'ctrl');
      })

      //check if the user has answered every question
      var slideshow = yield Slideshow
        .findById(session.slides)
        .exec();

      var answeredQuestions = yield Answer.aggregate()
        .match({ session: session._id, answeree: token })
        .group({_id : 0, questions: { $addToSet: "$question" }})
        .project({ _id: 0 , sameElements: { '$setEquals': [ "$questions", slideshow.questions ] } } )
        .exec();
        
      if(answeredQuestions[0].sameElements === true){
         var entry = yield WhitelistEntry.findById(token).exec();
         entry.sessionData.answeredAllDate = new Date();
         entry.markModified('sessionData');
         //save user
         var liftedSave = nodefn.lift(entry.save.bind(entry))
         var saved = yield liftedSave();
        
        socket.emit('asq:answered-all');
        socketUtils.notifyNamespaces('asq:answered-all', { userId: token }, session, 'ctrl');
      }

      //async
      calculateRankings(session);


      // Handle peer assessment
      if (self || peer) { // Add answers for peers
        // in the case of assessment -> add the answer to the queue
        var jobs = yield socketUtils.enqueueAnswersForAssessment(session._id, exercise, answers, token);
        var job = yield assessment.job.getNextAssessmentJob(session._id, exercise, token);
        job = assessment.job.activateJob(job);
        var html = yield assessment.render(job);

        if (!! html) {
          logger.info('Sending assessment to ' + socket.id);
          socket.emit('asq:assess', { html: html, exercise: exercise.id });
        }
        // notify ctrl of the assessment
        socketUtils.notifyCtrlForNewJobs([job]);

        var newJobs = yield assessment.job.getNextJobForIdleViewers(session._id, exercise); 
        var JobSocketsPairs = yield socketUtils.getSocketsForJobs(newJobs);
        JobSocketsPairs = yield socketUtils.activateJobsForSockets(JobSocketsPairs);
        var HtmlSocketsPairs = socketUtils.renderJobsForSockets(JobSocketsPairs);
        socketUtils.sendHtmlForSockets(HtmlSocketsPairs, exercise.id);
        socketUtils.notifyCtrlForNewJobs( newJobs);
      }
    }catch(err){
      logger.error(err.message, { err: err.stack });
    } 
  });

  var calculateRankings = gen.lift(function *calculateRankingsGen(session){
    var sessionStats = yield stats.getSessionStats(session)
    var rankings = sessionStats.rankings;
    console.log(rankings)
    socketUtils.notifyNamespaces('asq:rankings', {'rankings': rankings}, session._id, 'ctrl', 'folo');
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
      var assessments = yield assessment.save(session, evt.assessment, assessor);
      var progress =  yield assessment.job
        .terminateJobsAndUpdateProgress(session, exercise._id, assessor, assessee);

      progress = progress.toObject(); // Convert to object to add audience.
      // Add audience size to progress.
      progress.audience = socketUtils.getNumOfConnectedClients('/folo', progress.session)

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
      socketUtils.notifyNamespaces('asq:assess', assessEvt, session._id, 'ctrl');

      // Send updated progress to ctrl
      socketUtils.notifyNamespaces('asq:submitted', { progress: progress },
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

      socketUtils.notifyNamespaces('asq:new-assessment-job', jobEvt, session._id, 'ctrl');
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
        socketUtils.notifyNamespaces('asq:session-terminated', {}, sid,
          'ctrl', 'folo', 'wtap', 'stat');
      }, function onError(err) {
        logger.error('Error on terminate session:\n\t' + err.toString());
      });
  };

  var ioConnect = gen.lift(function *ioConnectGen(socket, namespace) {

    var session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id);

    socket.emit('asq:sessionFlow', {sessionFlow: session.flow})

    var evt = { slide: session.activeSlide };
    if (!! session.activeStatsQuestions.length) {
      var stats = yield socketUtils.getStats(session.activeStatsQuestions, session._id)
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
    socketUtils.notifyNamespaces('asq:ctrl-connected', evt, sessionId,
        'ctrl', 'wtap', 'folo');

    // TODO: check if sendConnectedClients call is needed
    //sendConnectedClients(sessionId, null, null, 'ctrl');
    socketUtils.sendProgresses(sessionId);
  };

  var ctrlDisconnect = function(socket) {
    logger.info('CTRL Disconnect');
    var sid = socket.request.sessionId;
    socketUtils.getTokenAndScreenName(socket)
    .then(
      function delAndNotify(userInfo) {
        return socketUtils.deleteAndNotify(socket, sid, userInfo, 'ctrl', 'ctrl', 'folo', 'wtap');
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

    return socketUtils.saveConnectionToRedis(token, socket).then(
      function onPush() {
        logger.info('[Redis] saved socket id');
        socketUtils.sendConnectedClients(sessionId, token, screenName, 'ctrl', 'wtap', 'folo');
        return submission.progress.updateConnect(sessionId, token);
    }).then(
      function notifyProgress(progresses) {
        return socketUtils.sendProgresses(sessionId); //Return updates to progress bars to ctrl on folo conn.
    }).then(function completeAnswers(progresses) {
      return socketUtils.sendSubmissions(socket, sessionId, token);
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
        socketUtils.notifyCtrlForNewJobs(jobs);
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

    socketUtils.getTokenAndScreenName(socket)
    .then(
      function(info) {
        userInfo = info
        return socketUtils.removeConnectionFromRedis(userInfo.token, socket).then(
            function onRemove() {
              logger.info('[Redis] Removed socket id');
              return when.resolve(true); });
    }).then(
      function delAndNotify() {
      return socketUtils.deleteAndNotify(socket, sid, userInfo, 'folo', 'ctrl', 'folo', 'wtap');
    }).then(
    function updateProgresses(data) {
      return submission.progress.updateDisconnect(sid, userInfo.token);
    }).then(
    function notifyProgress(data) {
      var i = data.length, progress;
      while(i--) {
        progress = data[i].toObject();
        progress.audience = socketUtils.getNumOfConnectedClients('/folo', progress.session)
        socketUtils.notifyNamespaces('asq:submitted', { progress: progress },
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

    socketUtils.deleteAndNotify(socket, sid, 'Wtap client', 'wtap', 'ctrl')
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
      socketUtils.deleteAndNotify(socket, sid, 'Stat client', 'stat', 'ctrl')
    .then(
    function statDisconnectSuccess(){
      logger.info('Stat disconnected');
    },
    function statDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'stat\':\n\t' +
        err.toString());
    });
  };

  function getUserSessionStats(socket, evt){
    stats.getUserSessionStats(evt.userId,evt.sessionId)
    .then(function(userData){
      userData.questionWidth = (100/userData.userQuestions.length);
      socket.emit('asq:user-session-stats', userData);
    }).catch(function(err){
      logger.error('Failed to get user session stats' +
        err.message, { err: err.stack });
    });
  }

  var foloChangeScreenName =  gen.lift(function *foloChangeScreenNameGen(socket, evt){
    var entry = yield WhitelistEntry.findOne({
     _id : socket.request.token ,
     session : socket.request.sessionId 
    }).exec();

    entry.screenName = evt.value;

    var liftedSave = nodefn.lift(entry.save.bind(entry))
    var saved = yield liftedSave();
    socketUtils.notifyNamespaces('asq:screenname-changed',{
      'userId': entry.id,
      'screenName': entry.screenName
    }, socket.request.sessionId, 'ctrl');
  });


  return {
    goto           : goto,
    submit         : submit,
    foloAssess     : assessed,
    ctrlConnect    : ctrlConnect,
    ctrlDisconnect : ctrlDisconnect,
    foloConnect    : foloConnect,
    foloDisconnect : foloDisconnect,
    foloChangeScreenName: foloChangeScreenName,
    wtapConnect    : wtapConnect,
    wtapDisconnect : wtapDisconnect,
    statConnect    : statConnect,
    statDisconnect : statDisconnect,
    terminate      : terminate,
    getUserSessionStats : getUserSessionStats
  }
}
