/** @module lib/socket/handlers
    @description handlers for socket events
*/

'use strict';

const _              = require('lodash')
const mongoose       = require('mongoose');
const arrayEqual     = require('../stats').arrayEqual;
const stats          = require('../stats/stats');
const logger         = require('logger-asq');
const flow           = require('../flow');
const assessment     = require('../assessment');
const submission     = require('../submission');
const hooks          = require ('../hooks/hooks');
const Answer         = db.model('Answer');
const AnswerProgress = db.model('AnswerProgress');
const Assessment     = db.model('Assessment');
const AssessmentJob  = db.model('AssessmentJob');
const Exercise       = db.model('Exercise');
const Question       = db.model('Question');
const Session        = db.model('Session');
const Slideshow      = db.model('Slideshow');
const User           = db.model('User');
const WhitelistEntry = db.model('WhitelistEntry');
const SessionEvent   = db.model('SessionEvent');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const settings = require('../settings').presentationSettings;
const presUtils = require('../utils').presentation;
const pluginPubsub = require('../plugin/pubsub');
const renameIdAndRemoveVersion =  require('../utils/format').renameIdAndRemoveVersion;
const cockpitStatsHydration = require('../liveApp').cockpitStatsHydration


module.exports =  function(socketUtils){

  const hydrateCockpit = coroutine(function *hydrateCockpitGen(socket, evt){
    const sessionId = socket.request.sessionId;
    let session = yield Session
      .findById(sessionId)
      .populate('slides')
      .lean()
      .exec();

    session = renameIdAndRemoveVersion(session);
    let presentation = session.slides;
    presentation = renameIdAndRemoveVersion(presentation);

    let exercises = yield Exercise
      .find(
        {
          _id: { $in:  presentation.exercises }
        })
      .lean()
      .exec();

    exercises = exercises.map(renameIdAndRemoveVersion);

    let questions = yield Question
      .find(
        {
          _id: { $in:  presentation.questions }
        })
      .lean()
      .exec();

    questions = questions.map(renameIdAndRemoveVersion);

    let answers = yield Answer
      .find(
        {
          session: sessionId
        },
        {
          logData: 0
        })
      .lean()
      .exec();

    answers = answers.map(renameIdAndRemoveVersion);

    let ctrlGoToEvents = yield SessionEvent
      .find({type: 'ctrl:goto', session: sessionId})
      .sort({time: 1})
      .lean()
      .exec();

    ctrlGoToEvents = ctrlGoToEvents.map(renameIdAndRemoveVersion);

    let studentPerceptionEvents = yield SessionEvent
      .find({type: 'student-perception-change', session: sessionId})
      .sort({time: 1})
      .lean()
      .exec();

    studentPerceptionEvents = studentPerceptionEvents.map(renameIdAndRemoveVersion);

    
    const slideTransitions = cockpitStatsHydration.generateSlideTransitionsArray(ctrlGoToEvents);
    // session.slideTransitions = slideTransitions;
    
    const studentPerceptionPerSlideTransition = cockpitStatsHydration.generateStudentPerceptionPerSlideArray(slideTransitions, studentPerceptionEvents);
    session.studentPerceptionPerSlideTransition = studentPerceptionPerSlideTransition;
    const wEntries = yield WhitelistEntry
      .find(
        {
          session: sessionId
        },
        {
          user: 1,
          screenName: 1,
          role: 1
        })
      .populate('user', '-password -slides -__v')
      .lean()
      .exec();

    const users = wEntries
      .map((wE) => {
        var user = renameIdAndRemoveVersion(wE.user)
        user.screenName = wE.screenName;
        user.role = wE.role;
        user.sessionData = wE.sessionData;
        user.whitelistEntry = wE._id;
        return user;
      })

    const state = {
      session,
      presentation,
      questions,
      exercises,
      answers,
      users,
    }

    socket.send({
      type: "hydrate_cockpit",
      body: {
        data: {
          state: state
        }
      }
    })
  })


  /*
   *  Emit an event to the ctrl, folo & ghost namespaces to go to a specific slide.
   */

   // TODO(triglian): handle cases where we don't find what we expect in the db
  const handleRequest = coroutine(function *handleRequestGen(socket, evt, cb){
    const session = yield Session
      .findOne({_id: socket.request.sessionId})
      .exec();

    if(!session){
      throw new Error(`Could not find session with id ${socket.request.sessionId}`);
    }

    const action = evt;
    cb = cb || (() => {})

    try{
      switch(evt.type){
        case 'hydrate_cockpit' :
          hydrateCockpit(socket, evt)
          break;
        case 'TOGGLE_ANSWER_IS_CENSORED':
          var answer = yield Answer
            .findById(action.id)
            .populate('question')
            .exec();

          answer.isCensored = !answer.isCensored;
          yield answer.save();

          if(answer.question === undefined
              || answer.question._id === undefined){
            throw new Error(`Could not find question for answer with id ${action.id}`);
          }

          var answerObj = answer.toObject();

          var question = answerObj.question;
          delete answerObj.question;

          question.uid = question._id.toString();
          delete question._id;


          var newEvt = {
            questionType: question.type,
            type: 'answerChanged',
            changeRecord: {
              path: 'isCensored',
              value: answer.isCensored,
              base: 'answer'
            },
            question,
            answer: answerObj
          };

          socketUtils.emitToRoles('asq:question_type', newEvt, session._id, 'ctrl', 'folo');

          return cb();
          break;
        case 'UPDATE_ANSWER_IS_CORRECT':
          var answer = yield Answer
            .findById(action.id)
            .populate('question')
            .exec();

          answer.isCorrect = action.value
          yield answer.save();

          if(answer.question === undefined
              || answer.question._id === undefined){
            throw new Error(`Could not find question for answer with id ${action.id}`);
          }

          var answerObj = answer.toObject();

          var question = answerObj.question;
          delete answerObj.question;

          question.uid = question._id.toString();
          delete question._id;

          var newEvt = {
            questionType: question.type,
            type: 'setCorrectness',
            question,
            answer: answerObj
          };

          socketUtils.emitToViewerWhitelistEntry('asq:question_type', newEvt, answer.answeree);

          return cb();
          break;
        case 'TOGGLE_ANSWER_IS_BOOKMARKED':
          var answer = yield Answer
            .findById(action.id)
            .exec();

          answer.isBookmarked = !answer.isBookmarked;
          yield answer.save();
          return cb();
          break;
        case 'TOGGLE_ANSWER_DISPLAY_TO_BEAMER':
          var answer = yield Answer
            .findById(action.id)
            .populate('question')
            .exec();

          answer.isDisplayedOnBeamer = !answer.isDisplayedOnBeamer;
          yield answer.save()

          if(answer.question === undefined
              || answer.question._id === undefined){
            throw new Error(`Could not find question for answer with id ${action.id}`);
          }

          var answerObj = answer.toObject();

          var question = answerObj.question;
          delete answerObj.question;

          question.uid = question._id.toString();
          delete question._id;

          var newEvt = {
            questionType: question.type,
            question
          };

          if(answer.isDisplayedOnBeamer){
            newEvt.type = 'setValue';
            newEvt.answer = answerObj;
          }else{
            newEvt.type = 'clearValue';
          }

          socketUtils.emitToRoles('asq:question_type', newEvt, session.id, 'ctrl');
          return cb();
          break;
        default:
          console.log('TODO handle unknown event type')
      }
    }catch(err){
      // TODO(vassilis): Do we need to send the exact error on the prsenter
      console.log(err)
      return cb(new Error(`Action ${action} failed!`))
    }
  })



  return {
    handleRequest  : handleRequest,
  }
}
