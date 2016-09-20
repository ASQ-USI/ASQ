/** @module eventDenormalizer/sessionEventDenormalizer
    @description Denormalize events so that they can be consumed by the ui
*/

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var WhitelistEntry = db.model('WhitelistEntry');
var Answer = db.model('Answer');
var Exercise = db.model('Exercise');
var Question = db.model('Question');
var SessionEventPC = db.model('SessionEventPC');
var renameIdAndRemoveVersion = require('../utils/format.js').renameIdAndRemoveVersion


function getUserFromWhitelistEntry(userid, field){
  field = field || '_id';
  var query = {};
  query[field] = userid;

  return  WhitelistEntry
    .findOne(query)
    .populate('user', '-password -slides -__v')
    .lean()
    .exec()
    .then(function getUserFromWhitelistEntryRes(wlistEntry){
      var user = renameIdAndRemoveVersion(wlistEntry.user)
      user.screenName = wlistEntry.screenName;
      user.role = wlistEntry.role;
      user.sessionData = wlistEntry.sessionData;
      return user;
    })
}

var denormalizeGotoSessionEvent = coroutine(function *denormalizeGotoSessionEventGen (sEvent){
  var user = yield getUserFromWhitelistEntry(sEvent.data.user, 'user');

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = user;
  sEvent.slide = sEvent.data.slide;

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});

var denormalizeExerciseSessionEvent = coroutine(function *denormalizeExerciseSessionEventGen (sEvent){
  var userPromise = getUserFromWhitelistEntry(sEvent.data.user, 'user');

  var exercisePromise = Exercise
    .findById(sEvent.data.exercise)
    .populate('questions')
    .lean()
    .exec();

  var results = yield Promise.all([userPromise, exercisePromise]);

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = results[0];
  sEvent.exercise = renameIdAndRemoveVersion(results[1]);

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});

var denormalizeQuestionSessionEvent = coroutine(function *denormalizeQuestionSessionEventGen (sEvent){
  var userPromise = getUserFromWhitelistEntry(sEvent.data.user, 'user');

  var questionPromise = Question
    .findById(sEvent.data.question)
    .lean()
    .exec();

  var results = yield Promise.all([userPromise, questionPromise]);

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = results[0];
  sEvent.question = renameIdAndRemoveVersion(results[1]);

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});

var denormalizeAnswerSessionEvent = coroutine(function *denormalizeAnswerSessionEventGen (sEvent){
  var userPromise = getUserFromWhitelistEntry(sEvent.data.answeree);

  var answerPromise = Answer
    .findById(sEvent.data.answer)
    .populate('exercise')
    .populate('question')
    .lean()
    .exec();

  var results = yield Promise.all([userPromise, answerPromise]);



  sEvent.origSessionEvent = sEvent._id;
  sEvent.answeree = results[0];
  sEvent.answer = renameIdAndRemoveVersion(results[1]);

  sEvent.answer.exercise = renameIdAndRemoveVersion(sEvent.answer.exercise);
  sEvent.answer.question = renameIdAndRemoveVersion(sEvent.answer.question);

  if(sEvent.answer.type == 'asq-multi-choice-q'){
    sEvent.answer.submission.forEach(function(opt){
      opt.uid = opt._id.toString();
      delete opt._id;
    })
  }

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});

var denormalizeQuestionInputSessionEvent = coroutine(function *denormalizeQuestionInputSessionEventGen (sEvent){
  var userPromise = getUserFromWhitelistEntry(sEvent.data.user, 'user');

  var questionPromise = Question
    .findById(sEvent.data.uid)
    .lean()
    .exec();

  var results = yield Promise.all([userPromise, questionPromise]);

  // abort if question doesn't exist!
  if(!results[1]) return;

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = results[0];
  sEvent.question = results[1];
  sEvent.value = sEvent.data.value;

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});


var denormalizeConnectionSessionEvent = coroutine(function *denormalizeConnectionSessionEventGen (sEvent){
  var user = yield getUserFromWhitelistEntry(sEvent.data.user, 'user');

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = user;

  delete sEvent.data;
  delete sEvent._id;
  return SessionEventPC.create(sEvent);
});

var denormalizeActivitySessionEvent = coroutine(function *denormalizeActivitySessionEventGen (sEvent){
  var userPromise = getUserFromWhitelistEntry(sEvent.data.user, 'user');

  var questionPromise = Question
    .findById(sEvent.data.question)
    .lean()
    .exec();

  var results = yield Promise.all([userPromise, questionPromise]);

  sEvent.origSessionEvent = sEvent._id;
  sEvent.user = results[0];
  sEvent.question = results[1];

  if(sEvent.type === "input" || sEvent.type === "questioninput"){
    sEvent.value = sEvent.data.value;
  }

  if(sEvent.type === "paste"){
    sEvent.textPlainData = sEvent.data.textPlainData;
  }

  delete sEvent.data;
  delete sEvent._id;

  return SessionEventPC.create(sEvent);
});


module.exports = {
  denormalizeEvent : function (sEvent){

    switch(sEvent.type){
      case "ctrl:goto":
        denormalizeGotoSessionEvent(sEvent);
        break;
      case "folo-connected":
      case "ctrl-connected":
      case "ghost-connected":
      case "folo-disconnected":
      case "ctrl-disconnected":
      case "ghost-disconnected":
        denormalizeConnectionSessionEvent(sEvent);
        break;
      case "exercise-activated":
      case "exercise-deactivated":
        denormalizeExerciseSessionEvent(sEvent);
        break;
      case "question-activated":
      case "question-deactivated":
        denormalizeQuestionSessionEvent(sEvent);
        break;
      case "answer-submitted":
        denormalizeAnswerSessionEvent(sEvent);
        break;
      case "viewer-idle":
      case "exercisefocus":
      case "exerciseblur":
      case "tabhidden":
      case "tabvisible":
      case "focusin":
      case "focusout":
      case "input":
        denormalizeActivitySessionEvent(sEvent);
        break;
      case "questioninput":
        denormalizeQuestionInputSessionEvent(sEvent);
        break;
      case "visibilitychange":
      case "windowfocus":
      case "windowblur":
      case "copy":
      case "paste":
      case "cut":
        denormalizeActivitySessionEvent(sEvent);
        break;
    }  
  }
}