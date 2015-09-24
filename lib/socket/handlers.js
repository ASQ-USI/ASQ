/** @module lib/socket/handlers
    @description handlers for socket events
*/

'use strict';

var _              = require('lodash')
var mongoose       = require('mongoose');
var arrayEqual     = require('../stats').arrayEqual;
var stats          = require('../stats/stats');
var logger         = require('logger-asq');
var flow           = require('../flow');
var assessment     = require('../assessment');
var submission     = require('../submission');
var submissionController = require('../submission/controller');
var hooks          = require ('../hooks/hooks');
var Answer         = db.model('Answer');
var AnswerProgress = db.model('AnswerProgress');
var Assessment     = db.model('Assessment');
var AssessmentJob  = db.model('AssessmentJob');
var Exercise       = db.model('Exercise');
var Question       = db.model('Question');
var Session        = db.model('Session');
var Slideshow      = db.model('Slideshow');
var User           = db.model('User');
var WhitelistEntry = db.model('WhitelistEntry');
var SessionEvent   = db.model('SessionEvent');
var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var settings = require('../settings').presentationSettings;
var presUtils = require('../utils').presentation;


module.exports =  function(socketUtils){

  /*
   *  Emit an event to the ctrl, folo & ghost namespaces to go to a specific slide.
   */
  var goto = function(socket, evt){
    logger.debug(evt)
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

  var onExerciseSubmission = coroutine(function *submitGen(socket, evt) {
    submissionController.exerciseSubmission(socket, evt);
  });

  var submit = coroutine(function *submitGen(socket, evt) {
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
        socketUtils.emitToRoles('asq:assessment',assessment.toObject() , session.id, 'ctrl');
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
        var saved = yield entry.save();
        
        socket.emit('asq:answered-all');
        socketUtils.emitToRoles('asq:answered-all', { userId: token }, session.id, 'ctrl');
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

  var calculateRankings = coroutine(function *calculateRankingsGen(session){
    var sessionStats = yield stats.getSessionStats(session)
    var rankings = sessionStats.rankings;
    socketUtils.emitToRoles('asq:rankings', {'rankings': rankings}, session._id, 'ctrl', 'folo');
  });

  var assessed = coroutine(function *assessedGen(socket, evt) {
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
      socketUtils.emitToRoles('asq:assess', assessEvt, session._id, 'ctrl');

      // Send updated progress to ctrl
      socketUtils.emitToRoles('asq:submitted', { progress: progress },
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

      socketUtils.emitToRoles('asq:new-assessment-job', jobEvt, session._id, 'ctrl');
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
        socketUtils.emitToRoles('asq:session-terminated', {}, sid,
          'ctrl', 'folo', 'ghost', 'stat');
      }, function onError(err) {
        logger.error('Error on terminate session:\n\t' + err.toString());
      });
  };

  var createSessionEvent= function(type, sessionId, user){

    return SessionEvent.create({
      session: sessionId,
      type: type,
      data: {
        user: user._id
      }
    })
  }

  var ioConnect = coroutine(function *ioConnectGen(socket, namespace) {

    var session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id);

    socket.emit('asq:sessionFlow', {sessionFlow: session.flow})

    var evt = { data: {step: session.activeSlide} };
    if (!! session.activeStatsQuestions.length) {
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    } else {
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    }
  });

  var ctrlConnect = coroutine(function *ctrlConnectGen(socket) {

    try{

      var screenName = socket.request.screenName;
      var sessionId = socket.request.sessionId;
      var evt       = { screenName : screenName };

      var  session = yield Session.findById(sessionId);
      if(! session) throw new Error("Could not find session");


      ioConnect(socket, 'ctrl');
      socketUtils.emitToRoles('asq:ctrl-connected', evt, sessionId,
          'ctrl', 'ghost', 'folo');

      // async
      createSessionEvent("ctrl-connected", sessionId, socket.user);

      socketUtils.sendConnectedClients(sessionId, 'ctrl');
      socketUtils.sendProgresses(sessionId);


      var result =  yield hooks.doHook('presenter_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
      });

    }catch(err){
      logger.error({ 
        err: require('util').inspect(err),
        stack: err.stack
      }, "err in ctrConnect");
    }
  });

  var ctrlDisconnect = function(socket) {
    logger.info('CTRL Disconnect');
    var sid = socket.request.sessionId;

    socketUtils.getTokenAndScreenName(socket)
    .then(
      function delAndNotify(userInfo) {
        return socketUtils.deleteAndNotify(socket, sid, userInfo, 'ctrl', 'ctrl', 'folo', 'ghost');
      })
     .then(
      function delAndNotify(userInfo) {
        return socketUtils.sendConnectedClients(sid, 'ctrl');

        //async
        createSessionEvent("ctrl-disconnected", sid, socket.user);
      },
      function ctrlDisconnectErr(err) {
        logger.error('Failed to disconnect client from \'ctrl\':\n\t' +
          err.toString(), { err: err.stack });
    });
  };

  var foloConnect = coroutine(function *foloConnectGen(socket) {
    try{

      var screenName = socket.request.screenName;
      var sessionId  = socket.request.sessionId;
      var token      = socket.request.token;
      var foloConnectedEvent = {
        screenName: screenName,
        token: token
      }

      var  session = yield Session.findById(sessionId);
      if(! session) throw new Error("Could not find session");

      ioConnect(socket, 'folo');

      yield socketUtils.saveConnectionToRedis(token, socket);
      logger.info('[Redis] saved socket id');
      socketUtils.emitToRoles('asq:folo-connected', foloConnectedEvent, sessionId, 'ctrl');
      socketUtils.sendConnectedClients(sessionId, 'ctrl');

      // async
      createSessionEvent("folo-connected", sessionId, socket.user);

      // send progress
      yield submission.progress.updateConnect(sessionId, token);
      yield socketUtils.sendProgresses(sessionId);
      yield socketUtils.sendSubmissions(socket, sessionId, token);

      // find assessment jobs
      var jobs = yield AssessmentJob.find({
        assessor : token,
        status   : 'active',
        session  : sessionId,
      });
      var exerciseIds = jobs.map(function(job) { return job.exercise });
      var dbExerciseIds = yield Answer.distinct('exercise', {
          answeree : token,
          session  : sessionId,
          exercise : {$nin: exerciseIds }
        }).exec();
      var exercises = yield Exercise.find({ _id: {$in: dbExerciseIds} });

      var jobs = yield Promise.map(exercises, function getNextJob(ex) {
        return assessment.job.getNextAssessmentJob(sessionId, ex, token);
      })

      jobs = _.remove(_.flatten(jobs), function(j) { return j !== null});
      socketUtils.notifyCtrlForNewJobs(jobs);

      //activate jobs
      yield Promise.map(jobs, function(j) { return assessment.job.activateJob(j); });

      //get and send assessment job html
      var htmls = yield Promise.map(jobs, function(j) { return assessment.render(j); });
      var i = Math.min(jobs.length, htmls.length);
      while(i--) {
        if (!! jobs[i] && !! htmls[i]) {
          socket.emit('asq:assess', {
            exercise : jobs[i]. exercise, html : htmls[i] });
        }
      }
      var hookResults = yield hooks.doHook('viewer_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
      });
    
    }catch(err){
      logger.error({ 
        err: require('util').inspect(err),
        stack: err.stack
      }, "err in foloConnect");
    }
  });

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
              return Promise.resolve(true); });
    }).then(
      function delAndNotify() {
      return socketUtils.deleteAndNotify(socket, sid, userInfo, 'folo', 'ctrl', 'folo', 'ghost');
    }).then(
    function updateProgresses(data) {
      return submission.progress.updateDisconnect(sid, userInfo.token);
    }).then(
    function notifyProgress(data) {
      var i = data.length, progress;
      while(i--) {
        progress = data[i].toObject();
        progress.audience = socketUtils.getNumOfConnectedClients('/folo', progress.session)
        socketUtils.emitToRoles('asq:submitted', { progress: progress },
          progress.session, 'ctrl');
      }
      socketUtils.sendConnectedClients(sid, 'ctrl');

      // async
      createSessionEvent("ctrl-disconnected", sid, socket.user);
    },
    function foloDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'folo\':\n\t' +
        err.toString(), { err: err.stack });
    });
  };

  var ghostConnect = coroutine(function *ghostConnectGen(socket){
    var screenName = socket.request.screenName;
    var sessionId  = socket.request.sessionId;
    var token      = socket.request.token;
    var ghostConnectedEvent = {
      screenName: screenName,
      token: token
    }

    var  session = yield Session.findById(sessionId);
    if(! session) throw new Error("Could not find session");

    ioConnect(socket, 'ghost');
    socketUtils.emitToRoles('asq:ghost-connected', ghostConnectedEvent, sessionId,
     'ctrl', 'ghost', 'folo');
    socketUtils.sendConnectedClients(sessionId, 'ctrl');

    // async
    createSessionEvent("ghost-connected", sessionId, socket.user);

    var result =  yield hooks.doHook('ghost_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
    });
  });

  var ghostDisconnect = function(socket) {
    var sid = socket.request.sessionId;

    socketUtils.deleteAndNotify(socket, sid, 'Wtap client', 'ghost', 'ctrl')
    .then(
    function ghostDisconnectSuccess(){
      logger.info('Wtap disconnected');

      // async
      createSessionEvent("ghost-disconnected", sid, socket.user);
    },
    function ghostDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'ghost\':\n\t' +
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

  var foloChangeScreenName =  coroutine(function *foloChangeScreenNameGen(socket, evt){
    var entry = yield WhitelistEntry.findOne({
     _id : socket.request.token ,
     session : socket.request.sessionId 
    }).exec();

    entry.screenName = evt.value;

    var saved = yield entry.save();
    socketUtils.emitToRoles('asq:screenname-changed',{
      'userId': entry.id,
      'screenName': entry.screenName
    }, socket.request.sessionId, 'ctrl');
  });

  var foloSnitch = function foloSnitch(socket, evt){
    evt.data = evt.data || {};
    evt.data.user = socket.user._id;
    SessionEvent.create({
          session: socket.request.sessionId ,
          type: evt.type,
          data: evt.data
        })
  };

  var updatePresentationSettings = coroutine(function *updatePresentationSettingsGen(socket, evt) {
    var user = socket.user;
    var userId = user ? user._id : null;
    if ( !userId ) {
      socket.emit('asq:update_presentation_settings_res', {'state': false});
      return
    }

    var presentation = yield Slideshow.findById(evt.presentationId).exec();
    // Check the ownership
    if ( ! presentation || presentation.owner.toString() !== userId ) {
      socket.emit('asq:update_presentation_settings_res', {'state': false});
      return
    }

    

    if ( evt.scope !== 'presentation' && evt.scope !== 'exercise' ) {
      return
    }

    var exerciseSettings = null;
    try {
      if ( evt.scope === 'presentation' ) {
        yield settings.updateSlideshowSettings(evt.settings, evt.presentationId);
        exerciseSettings = yield settings.getDustSettingsOfExercisesAll(evt.presentationId);
      } else if ( evt.scope === 'exercise' ) {
        yield settings.updateExerciseSettings(evt.settings, evt.presentationId, evt.exerciseId);
      } 
      

      socket.emit('asq:update_presentation_settings_res', {
        'status': 'success',
        'scope': evt.scope,
        'settings' : exerciseSettings 
      });
      
      var sessionId = yield presUtils.getSessionIfLiveByUser(userId, evt.presentationId);
      if ( !sessionId ) return;

      // This is a Live presentation.
      socketUtils.emitToRoles('asq:update_live_presentation_settings', evt, sessionId, 'ctrl');
      socketUtils.emitToRoles('asq:update_live_presentation_settings', evt, sessionId, 'folo');
    } 
    catch(e){
      socket.emit('asq:update_presentation_settings_res', {
        'status': 'failed',
        'scope': evt.scope,
        'settings' : [] 
      });
      console.log(e);
    }
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
    foloSnitch : foloSnitch,
    ghostConnect    : ghostConnect,
    ghostDisconnect : ghostDisconnect,
    statConnect    : statConnect,
    statDisconnect : statDisconnect,
    terminate      : terminate,
    getUserSessionStats : getUserSessionStats,
    onExerciseSubmission: onExerciseSubmission,
    updatePresentationSettings: updatePresentationSettings
  }
}
