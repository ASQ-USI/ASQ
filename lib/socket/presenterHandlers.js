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
const cockpitStatsHydration = require('../utils').cockpitStatsHydration


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

    let ctrlGoToEventsTable = cockpitStatsHydration.generateCtrlGoToEventsTable(ctrlGoToEvents);
    
    const slideTransitions = cockpitStatsHydration.generateSlideTransitionsArray(ctrlGoToEvents);
    
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
      answers,
      users,
      cockpitState
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
  const handleRequest = function(socket, evt){
    switch(evt.type){
      case "hydrate_cockpit" :
        hydrateCockpit(socket, evt)
        break;
      default:
        console.log("TODO handle unknown event type")
    }
  }



  return {
    handleRequest  : handleRequest,
  }
}
