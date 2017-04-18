'use strict';

const logger = require('logger-asq');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const Slideshow = db.model('Slideshow');
const Session = db.model('Session');
const WhitelistEntry = db.model('WhitelistEntry');
const SessionEvent = db.model('SessionEvent');
const Question = db.model('Question');
const ObjectId = require('mongoose').Types.ObjectId;

module.exports = function(socketUtils){

  const createGotoSessionEvents = function(sessionid, socket, slide, 
    inactiveExercises, activeExercises, inactiveQuestions, activeQuestions){
    const events = [];
    const userId = socket.user._id.toString();

    // goto event
    events.push(new SessionEvent({
      session: sessionid,
      type: 'ctrl:goto',
      data: {
        user: userId,
        slide: slide
      }
    }));

    // de-activate previous exercises events
    inactiveExercises.forEach(function(ex){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'exercise-deactivated',
        data: {
          user: userId,
          exercise: ObjectId(ex)
        }
      }));
    });

    // activate current exercises events
    activeExercises.forEach(function(ex){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'exercise-activated',
        data: {
          user: userId,
          exercise: ObjectId(ex)
        }
      }));
    });

    // de-activate previous questions events
    inactiveQuestions.forEach(function(q){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'question-deactivated',
        data: {
          user: userId,
          question: ObjectId(q)
        }
      }));
    });

    // activate current questions events
    activeQuestions.forEach(function(q){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'question-activated',
        data: {
          user: userId,
          question: ObjectId(q)
        }
      }));
    });

    return SessionEvent.create(events);
  }

  const createGotoFoloSessionEvents = function(sessionid, socket, slide, 
    inactiveExercises, activeExercises, inactiveQuestions, activeQuestions){
    const events = [];
    const userId = socket.user._id.toString();

    // goto event
    events.push(new SessionEvent({
      session: sessionid,
      type: 'folo:goto',
      data: {
        user: userId,
        slide: slide
      }
    }));

    // de-activate previous exercises events
    inactiveExercises.forEach(function(ex){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'folo:exercise-deactivated',
        data: {
          user: userId,
          exercise: ObjectId(ex)
        }
      }));
    });

    // activate current exercises events
    activeExercises.forEach(function(ex){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'folo:exercise-activated',
        data: {
          user: userId,
          exercise: ObjectId(ex)
        }
      }));
    });

    // de-activate previous questions events
    inactiveQuestions.forEach(function(q){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'folo:question-deactivated',
        data: {
          user: userId,
          question: ObjectId(q)
        }
      }));
    });

    // activate current questions events
    activeQuestions.forEach(function(q){
      events.push(new SessionEvent({
        session: sessionid,
        type: 'folo:question-activated',
        data: {
          user: userId,
          question: ObjectId(q)
        }
      }));
    });

    return SessionEvent.create(events);
  }

  /*
   *  Handle a goto event from ./ctrl namespace
   */
  const gotoCtrl = coroutine(function *gotoGen(socket, evt) {
    try{
      const session = yield Session
        .findOne({_id: socket.request.sessionId})
        .populate('slides')
        .exec();

      // TODO load adapter based on presentation type
      const pf = session.slides.presentationFramework;
      const adapter = require('../presentationAdapter/adapters')[pf];
      const nextSlide = adapter.getSlideFromGotoData(evt.data);

      if (nextSlide == null){
        logger.debug('lib.utils.socket:goto nextSlide is null')
        // drop event
        return;
      }

      const slideshow = yield Slideshow.findById(session.slides).lean().exec()
      session.activeSlide = nextSlide;
      const inactiveExercises = session.activeExercises || [];
      const activeExercises = session.activeExercises = slideshow.exercisesPerSlide[nextSlide] || []
      
      const inactiveQuestions = session.activeQuestions || [];
      const activeQuestions = session.activeQuestions = slideshow.questionsPerSlide[nextSlide] || [];


      yield session.save(); 

      // async create events
      createGotoSessionEvents(session._id, socket, nextSlide,
        inactiveExercises, activeExercises,inactiveQuestions, activeQuestions);
      
      socketUtils.emitToRoles('asq:goto', evt, session._id, 'ctrl', 'folo', 'ghost');

    }catch(err) {
      logger.error('On gotoCtrl: ' + err.message, {err: err.stack});
    };
  });

  /*
   *  Handle a goto event from ./ctrl namespace
   */
  const gotoFolo = coroutine(function *gotoGen(socket, evt) {
    try{
      const session = yield Session
        .findOne({_id: socket.request.sessionId})
        .populate('slides')
        .exec();

      const whitelistEntry = yield WhitelistEntry
        .findById(socket.request.token)
        .exec();

      // TODO load adapter based on presentation type
      const pf = session.slides.presentationFramework;
      const adapter = require('../presentationAdapter/adapters')[pf];
      const nextSlide = adapter.getSlideFromGotoData(evt.data);

      if (nextSlide == null){
        logger.debug('lib.utils.socket:goto nextSlide is null')
        // drop event
        return;
      }

      const slideshow = session.slides
      // yield Slideshow.findById(session.slides).lean().exec()
      whitelistEntry.sessionData = whitelistEntry.sessionData || {};
      whitelistEntry.sessionData.activeSlide = nextSlide;
      const inactiveExercises = whitelistEntry.sessionData.activeExercises || [];
      const activeExercises =  whitelistEntry.sessionData.activeExercises = slideshow.exercisesPerSlide[nextSlide] || []
      
      const inactiveQuestions =  whitelistEntry.sessionData.activeQuestions || [];
      const activeQuestions =  whitelistEntry.sessionData.activeQuestions = slideshow.questionsPerSlide[nextSlide] || [];

      whitelistEntry.markModified('sessionData');
      yield whitelistEntry.save(); 

      // async create events
      createGotoFoloSessionEvents(session._id, socket, nextSlide,
        inactiveExercises, activeExercises,inactiveQuestions, activeQuestions);
      
      socket.emit('asq:goto', evt)

    }catch(err) {
      logger.error('On gotoFolo: ' + err.message, {err: err.stack});
    };
  });

  const handleSocketEvent = function(eventName, socket, evt){
     switch(eventName){
      case 'asq:goto':
        if (socket.nsp.name === '/ctrl'){
          gotoCtrl(socket, evt);
        }else if (socket.nsp.name === '/folo'){
          gotoFolo(socket, evt);
        }
        
        break
     }
  }

  return {
    handleSocketEvent: handleSocketEvent
  }

}
