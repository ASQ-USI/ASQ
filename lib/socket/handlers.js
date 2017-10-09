/** @module lib/socket/handlers
    @description handlers for socket events
*/

'use strict';

const _ = require('lodash')
const mongoose = require('mongoose');
const arrayEqual = require('../stats').arrayEqual;
const stats = require('../stats/stats');
const logger = require('logger-asq');
const flow = require('../flow');
const assessment = require('../assessment');
const submission = require('../submission');
const hooks = require ('../hooks/hooks');
const Answer = db.model('Answer');
const AnswerProgress = db.model('AnswerProgress');
const Assessment = db.model('Assessment');
const AssessmentJob  = db.model('AssessmentJob');
const Exercise = db.model('Exercise');
const Question = db.model('Question');
const Session = db.model('Session');
const Slideshow = db.model('Slideshow');
const User  = db.model('User');
const WhitelistEntry = db.model('WhitelistEntry');
const SessionEvent   = db.model('SessionEvent');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const settings = require('../settings').presentationSettings;
const presUtils = require('../utils').presentation;
const pluginPubsub = require('../plugin/pubsub');
const liveApp = require('../liveApp');

module.exports =  function(socketUtils){

  /*
   *  Emit an event to the ctrl, folo & ghost namespaces to go to a specific slide.
   */
  const goto = function(socket, evt){
    logger.debug(evt)
    Session.findOne({_id: socket.request.sessionId}, function(err, session){
      if(err){
        logger.error(err.message, { err: err.stack });
      }else{
        try{
          const sessionFlow = flow[session.flow](socketUtils);
          sessionFlow.handleSocketEvent('asq:goto', socket, evt);
        }catch(err){
          logger.error(err.message, { err: err.stack });
        }
      }
    })
  }

  const onExerciseSubmission = coroutine(function *submitGen(socket, evt) {
    submission.exerciseSubmission(socket, evt);
  });

  const submit = coroutine(function *submitGen(socket, evt) {
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

      const token = socket.request.token;
      const session = yield Session.findOne({_id: socket.request.sessionId}).exec();

      //TODO : return object instead of an array
      const data = yield submission.answer.save(session, token, evt.exercise);

      const exercise = data[0];
      const questions = data[1];
      const answers = data[2];
      const progress = data[3];
      const self = data[4];
      const peer = data[5];

      socketUtils.sendProgress(progress, session.id);

      socket.emit('asq:submitted', {
        exercise : exercise.id,
        resubmit : exercise.allowResubmit,
        status   : 'success',
        type     : 'answer'
      });

      //see if automatic asssemsent was created
      const assessments = yield Assessment.find({
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
      const slideshow = yield Slideshow
        .findById(session.slides)
        .exec();

      const answeredQuestions = yield Answer.aggregate()
        .match({ session: session._id, answeree: token })
        .group({_id : 0, questions: { $addToSet: '$question' }})
        .project({ _id: 0 , sameElements: { '$setEquals': [ '$questions', slideshow.questions ] } } )
        .exec();

      if(answeredQuestions[0].sameElements === true){
        const entry = yield WhitelistEntry.findById(token).exec();
        entry.sessionData.answeredAllDate = new Date();
        entry.markModified('sessionData');
        //save user
        const saved = yield entry.save();

        socket.emit('asq:answered-all');
        socketUtils.emitToRoles('asq:answered-all', { userId: token }, session.id, 'ctrl');
      }

      //async
      calculateRankings(session);


      // Handle peer assessment
      if (self || peer) { // Add answers for peers
        // in the case of assessment -> add the answer to the queue
        const jobs = yield socketUtils.enqueueAnswersForAssessment(session._id, exercise, answers, token);
        const job = yield assessment.job.getNextAssessmentJob(session._id, exercise, token);
        job = assessment.job.activateJob(job);
        const html = yield assessment.render(job);

        if (!! html) {
          logger.info('Sending assessment to ' + socket.id);
          socket.emit('asq:assess', { html: html, exercise: exercise.id });
        }
        // notify ctrl of the assessment
        socketUtils.notifyCtrlForNewJobs([job]);

        const newJobs = yield assessment.job.getNextJobForIdleViewers(session._id, exercise);
        const JobSocketsPairs = yield socketUtils.getSocketsForJobs(newJobs);
        JobSocketsPairs = yield socketUtils.activateJobsForSockets(JobSocketsPairs);
        const HtmlSocketsPairs = socketUtils.renderJobsForSockets(JobSocketsPairs);
        socketUtils.sendHtmlForSockets(HtmlSocketsPairs, exercise.id);
        socketUtils.notifyCtrlForNewJobs( newJobs);
      }
    }catch(err){
      logger.error(err.message, { err: err.stack });
    }
  });

  const calculateRankings = coroutine(function *calculateRankingsGen(session){
    const sessionStats = yield stats.getSessionStats(session)
    const rankings = sessionStats.rankings;
    socketUtils.emitToRoles('asq:rankings', {'rankings': rankings}, session._id, 'ctrl', 'folo');
  });

  const assessed = coroutine(function *assessedGen(socket, evt) {
    logger.debug('Assessment');
    try{
      if (!evt.assessment) {
        logger.error(new Error('Invalid Submission: Missing or invalid exercise.'));
        return;
      }
      if (!evt.assessment.exercise) {
        logger.error(new Error('Invalid or missing exercise reference.'));
      }

      const assessee = evt.assessment.assessee;
      const assessor = socket.request.token;

      const session = yield Session.findOne({_id: socket.request.sessionId}).exec();
      const exercise = yield Exercise.findById(evt.assessment.exercise).exec();
      const assessments = yield assessment.save(session, evt.assessment, assessor);
      const progress =  yield assessment.job
        .terminateJobsAndUpdateProgress(session, exercise._id, assessor, assessee);

      progress = progress.toObject(); // Convert to object to add audience.
      // Add audience size to progress.
      progress.audience = yield socketUtils.getNumOfConnectedClients('/folo', progress.session.toString())

      let score=0;
      for (let i = assessments.length - 1; i >= 0; i--) {
        score += assessments[i].score;
      };

      score = ~~(score/assessments.length);
      //notify ctrl for the assessment
      const assessEvt = {
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

      const job = yield assessment.job.getNextAssessmentJob(progress.session, exercise, assessor);
      const jobEvt = {
          exerciseId: exercise._id,
          assessor: {token:job.assessor},
          assessee: {token:job.assessee}
        };

      socketUtils.emitToRoles('asq:new-assessment-job', jobEvt, session._id, 'ctrl');
      const html = yield assessment.render(job);
      if (html) {
        socket.emit('asq:assess', { html: html, exercise: exercise.id });
      }
    }catch(err){
      logger.error(err.message, { err: err.stack });
    }
  });

  const terminateSession = function(socket, evt) {
    const sid = socket.request.sessionId;
    const uId = socket.user._id

    Session.terminateSession(uId, sid)
    .catch(function onError(err) {
      logger.error('Error on terminate session:\n\t' + err.toString());
    })
  };

  const createSessionEvent = function(type, sessionId, user){

    return SessionEvent.create({
      session: sessionId,
      type: type,
      data: {
        user: user._id
      }
    })
  }

  const ioConnect = coroutine(function *ioConnectGen(socket, namespace) {

    const session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id.toString());

    socket.emit('asq:sessionFlow', {sessionFlow: session.flow})

    const evt = { data: {step: session.activeSlide} };
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

  const ctrlConnect = coroutine(function *ctrlConnectGen(socket) {

    try{

      const screenName = socket.request.screenName;
      const sessionId = socket.request.sessionId;
      const evt       = { screenName : screenName };

      const  session = yield Session.findById(sessionId);
      if(! session) throw new Error('Could not find session');


      ioConnect(socket, 'ctrl');
      socketUtils.emitToRoles('asq:ctrl-connected', evt, sessionId,
          'ctrl', 'ghost', 'folo');

      // async
      createSessionEvent('ctrl-connected', sessionId, socket.user);

      socketUtils.sendConnectedClientsAfter1Ms(sessionId.toString(), 'ctrl');
      socketUtils.sendProgresses(sessionId);


      const result =  yield hooks.doHook('presenter_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
      });

    }catch(err){
      logger.error({
        err: require('util').inspect(err),
        stack: err.stack
      }, 'err in ctrConnect');
    }
  });

  const ctrlDisconnect = function(socket) {
    logger.info('CTRL Disconnect');
    const sid = socket.request.sessionId;

    socketUtils.getTokenAndScreenName(socket)
    .then(
      function delAndNotify(userInfo) {
        return socketUtils.deleteAndNotify(socket, sid, userInfo, 'ctrl', 'ctrl', 'folo', 'ghost');
      })
     .then(
      function delAndNotify(userInfo) {
        return socketUtils.sendConnectedClientsAfter1Ms(sid.toString(), 'ctrl');

        //async
        createSessionEvent('ctrl-disconnected', sid, socket.user);
      },
      function ctrlDisconnectErr(err) {
        logger.error('Failed to disconnect client from \'ctrl\':\n\t' +
          err.toString(), { err: err.stack });
    });
  };

  const foloConnect = coroutine(function *foloConnectGen(socket) {
    try{

      const screenName = socket.request.screenName;
      const sessionId = socket.request.sessionId;
      const token = socket.request.token;
      const foloConnectedEvent = {
        screenName: screenName,
        token: token
      }

      const  session = yield Session.findById(sessionId);
      if(! session) throw new Error('Could not find session');

      ioConnect(socket, 'folo');

      yield socketUtils.saveConnectionToRedis(token, socket);
      logger.info('[Redis] saved socket id');
      socketUtils.emitToRoles('asq:folo-connected', foloConnectedEvent, sessionId, 'ctrl');
      socketUtils.sendConnectedClientsAfter1Ms(sessionId.toString(), 'ctrl');

      // async
      createSessionEvent('folo-connected', sessionId, socket.user);

      // send progress
      yield submission.progress.updateConnect(sessionId, token);
      yield socketUtils.sendProgresses(sessionId);
      yield socketUtils.sendSubmissions(socket, sessionId, token);

      // find assessment jobs
      let jobs = yield AssessmentJob.find({
        assessor : token,
        status   : 'active',
        session  : sessionId,
      });
      const exerciseIds = jobs.map(function(job) { return job.exercise });
      const dbExerciseIds = yield Answer.distinct('exercise', {
          answeree : token,
          session  : sessionId,
          exercise : {$nin: exerciseIds }
        }).exec();
      const exercises = yield Exercise.find({ _id: {$in: dbExerciseIds} });

      jobs = yield Promise.map(exercises, function getNextJob(ex) {
        return assessment.job.getNextAssessmentJob(sessionId, ex, token);
      })

      jobs = _.remove(_.flatten(jobs), function(j) { return j !== null});
      socketUtils.notifyCtrlForNewJobs(jobs);

      //activate jobs
      yield Promise.map(jobs, function(j) { return assessment.job.activateJob(j); });

      //get and send assessment job html
      const htmls = yield Promise.map(jobs, function(j) { return assessment.render(j); });
      let i = Math.min(jobs.length, htmls.length);
      while(i--) {
        if (!! jobs[i] && !! htmls[i]) {
          socket.emit('asq:assess', {
            exercise : jobs[i]. exercise, html : htmls[i] });
        }
      }
      const hookResults = yield hooks.doHook('viewer_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
      });

    }catch(err){
      logger.error({
        err: require('util').inspect(err),
        stack: err.stack
      }, 'err in foloConnect');
    }
  });

  const foloDisconnect = function(socket) {
    const sid = socket.request.sessionId;
    let userInfo;

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
    coroutine(function *notifyProgressGen(data) {
      let i = data.length, progress;
      while(i--) {
        progress = data[i].toObject();
        progress.audience = yield socketUtils.getNumOfConnectedClients('/folo', progress.session.toString())
        socketUtils.emitToRoles('asq:submitted', { progress: progress },
          progress.session, 'ctrl');
      }
      socketUtils.sendConnectedClientsAfter1Ms(sid.toString(), 'ctrl');
;
      // async
      createSessionEvent('folo-disconnected', sid, socket.user);
    }),
    function foloDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'folo\':\n\t' +
        err.toString(), { err: err.stack });
    });
  };

  const ghostConnect = coroutine(function *ghostConnectGen(socket){
    const screenName = socket.request.screenName;
    const sessionId = socket.request.sessionId;
    const token = socket.request.token;
    const ghostConnectedEvent = {
      screenName: screenName,
      token: token
    }

    const  session = yield Session.findById(sessionId);
    if(! session) throw new Error('Could not find session');

    ioConnect(socket, 'ghost');
    socketUtils.emitToRoles('asq:ghost-connected', ghostConnectedEvent, sessionId,
     'ctrl', 'ghost', 'folo');
    socketUtils.sendConnectedClientsAfter1Ms(sessionId.toString(), 'ctrl');

    // async
    createSessionEvent('ghost-connected', sessionId, socket.user);

    const result =  yield hooks.doHook('ghost_connected', {
        socketId: socket.id,
        session_id: session._id,
        presentation_id: session.slides,
        whitelistId: socket.request.token
    });
  });

  const ghostDisconnect = function(socket) {
    const sid = socket.request.sessionId;

    socketUtils.deleteAndNotify(socket, sid, 'Wtap client', 'ghost', 'ctrl')
    .then(
    function ghostDisconnectSuccess(){
      logger.info('Wtap disconnected');

      // async
      createSessionEvent('ghost-disconnected', sid, socket.user);
    },
    function ghostDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'ghost\':\n\t' +
        err.toString());
    });
  };

  const statConnect = function(socket) {
    ioConnect(socket, 'stat');
  };

  const statDisconnect = function(socket) {
    const sid = socket.request.sessionId
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

  const foloChangeScreenName =  coroutine(function *foloChangeScreenNameGen(socket, evt){
    const entry = yield WhitelistEntry.findOne({
     _id : socket.request.token ,
     session : socket.request.sessionId
    }).exec();

    entry.screenName = evt.value;

    const saved = yield entry.save();
    socketUtils.emitToRoles('asq:screenname-changed',{
      'userId': entry.id,
      'screenName': entry.screenName
    }, socket.request.sessionId, 'ctrl');
  });

  const foloSnitch = function foloSnitch(socket, evt){
    evt.data = evt.data || {};
    evt.data.user = socket.user._id;
    SessionEvent.create({
          session: socket.request.sessionId ,
          type: evt.type,
          data: evt.data
        })
  };

  const updatePresentationSettings = coroutine(function *updatePresentationSettingsGen(socket, evt) {
    const user = socket.user;
    const userId = user ? user._id : null;
    if ( !userId ) {
      socket.emit('asq:update_presentation_settings_res', {'status': false});
      return
    }

    const presentation = yield Slideshow.findById(evt.presentationId).exec();
    // Check the ownership
    if ( ! presentation || presentation.owner.toString() !== userId ) {
      socket.emit('asq:update_presentation_settings_res', {'status': false});
      return
    }
    if ( evt.scope !== 'presentation' && evt.scope !== 'exercise' ) {
      socket.emit('asq:update_presentation_settings_res', {'status': false});
      return
    }
    const exerciseSettings = null;
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

      const sessionId = yield presUtils.getSessionIfLiveByUser(userId, evt.presentationId);
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

  const ctrlAsqPlugin = function(socket, evt){
    evt.socketId = socket.id;
    evt.sessionId = socket.request.sessionId.toString();
    pluginPubsub.emit('plugin', evt);
  }
  /**
    It will forward some data, from the control (ctrl) namespace, to the folo and ghost namespaces in the given session 
    through the event name.
    Before forwarding the data, it retrieves the session, all the viewer questions made during said session, and updates the session.
    Data carries a questionId parameter, if it's present it means that the presenter wants to show a question, if it's undefined it means that the presenter
    wants to close the modal.
    @param {String} evtName - The name of the event 
    @param {Object} data - The data that is being emitted
    @param {ObjectId} sessionId - The id of the current ongoing session
    @return {}
  */
  const ctrlUpdateActiveViewerQuestionAndNotify = coroutine(function*ctrlUpdateActiveViewerQuestionAndNotifyGen (evtName, data, sessionId) {
    const questionId = data.questionId || null;
    // retrieve current session
    const session = yield liveApp.retrieveSessionById(sessionId);
    if (!session) return new Error('Session with the given id could not be found');
    session.data = session.data || {};
    // Retrieving all the viewer questions that were made during the session
    const viewerQuestions = yield liveApp.retrieveViewerQuestionsBySessionId(sessionId);
    const studentQuestionsEnabled = session.data.studentQuestionsEnabled;
    const sessionData = {
      activeViewerQuestion: questionId,
      viewerQuestions,
      studentQuestionsEnabled,
    };

    // updating the current session
    session.data = sessionData;
    yield Session
      .findById(sessionId)
      .update(session)
      .exec();
    // If it's null it means that the presenter wants to close the modal, so we do not have to forward any data
    if (questionId === null) {
      socketUtils.emitToRoles(evtName, data, sessionId, 'folo');
      socketUtils.emitToRoles(evtName, data, sessionId, 'ghost');
      return;
    }
    // Once the session has been updated, retrieve the question to forward and forward it
    const questionToForward = yield liveApp.retrieveViewerQuestionById(questionId);
    if (!questionToForward) return new Error('Viewer question with the given identifier could not be found');
    // Forwarding the question
    data.question = questionToForward;
    socketUtils.emitToRoles(evtName, data, sessionId, 'folo');
    socketUtils.emitToRoles(evtName, data, sessionId, 'ghost');
  });

  const ctrlUpdateStudentQuestionsEnabled = coroutine(function*ctrlUpdateStudentQuestionsEnabledGen(evtName, data, sessionId) {
    // retrieve current session
    const session = yield liveApp.retrieveSessionById(sessionId);
    if (!session) return new Error('Session with the given id could not be found');
    session.data = session.data || {};
    session.data.studentQuestionsEnabled = data.studentQuestionsEnabled;
    yield Session
      .findById(sessionId)
      .update(session)
      .exec();

    // Forwarding the informations
    socketUtils.emitToRoles(evtName, data, sessionId, 'folo');
    socketUtils.emitToRoles(evtName, data, sessionId, 'ghost');
    socketUtils.emitToRoles(data.type, data, sessionId, 'ctrl');
  });

  return {
    goto           : goto,
    submit         : submit,
    foloAssess     : assessed,
    ctrlConnect    : ctrlConnect,
    ctrlDisconnect : ctrlDisconnect,
    ctrlAsqPlugin  : ctrlAsqPlugin,
    foloConnect    : foloConnect,
    foloDisconnect : foloDisconnect,
    foloChangeScreenName: foloChangeScreenName,
    foloSnitch : foloSnitch,
    ghostConnect    : ghostConnect,
    ghostDisconnect : ghostDisconnect,
    statConnect    : statConnect,
    statDisconnect : statDisconnect,
    terminateSession : terminateSession,
    getUserSessionStats : getUserSessionStats,
    onExerciseSubmission: onExerciseSubmission,
    updatePresentationSettings: updatePresentationSettings,
    ctrlUpdateActiveViewerQuestionAndNotify: ctrlUpdateActiveViewerQuestionAndNotify,
    ctrlUpdateStudentQuestionsEnabled: ctrlUpdateStudentQuestionsEnabled,
  }
}
