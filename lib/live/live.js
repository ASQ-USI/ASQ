const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const logger = require('logger-asq');
const lib = require('../index.js');
const presUtils = lib.utils.presentation;
const Slideshow = db.model('Slideshow');
const Exercise = db.model('Exercise');
const User = db.model('User', schemas.userSchema);
const Session = db.model('Session');
const Question = db.model('Question');


const generateNewSession = function (userId, slideshowId, presFlow, authLevel) {
  const newSession = new Session();
  newSession.presenter = userId;
  newSession.slides = slideshowId;
  newSession.flow = ( Session.schema.path('flow').enumValues
    .indexOf(presFlow) > -1 ) ? presFlow : 'ctrl';
  newSession.authLevel = ( Session.schema.path('authLevel').enumValues
    .indexOf(authLevel) > -1 ) ? authLevel : 'public';

  /* 
    This is needed for the live app, since we need to store the active viewer question (the question that it's displayed to the users)
  */
  newSession.data = {
    activeViewerQuestion: null,
    questions: [],
    studentQuestionsEnabled: false,
  };
  newSession.markModified('data');

  if(slideshow.slidesTree
     && slideshow.slidesTree.steps
     && slideshow.slidesTree.steps[0]) {

     newSession.activeSlide = slideshow.slidesTree.steps[0];
  }
  return newSession;
};

const retrieveUserByUserId = function (userId) {
  const userPromise = User
    .findById(userId)
    .exec()
    .then( function onUser(user){
      if(!user){
        return Promise.reject(new Error('No user with this id'))
      } //FIXME create proper error like in list presentations
      // user.current = (newSession._id)
      // user.liveSessions.addToSet(newSession._id)
      return user.save()
    });
  return userPromise;
}

const generateImplicitQuestion = function (userId, sessionId) {
  const implicitQuestionData = {
    type: 'asq-text-input-q',
    author: userId,
    data: {
      description: 'Implicit question placeholder for live app student questions',
      type: 'implicit-student-question',
      session: sessionId,
    },
  };

  return new Question(implicitQuestionData);
}

const generateViewerQuestionExercise = function (implicitQuestionId) {
  const viewerQuestionExerciseData = {
    stem: 'viewerQuestionExercise',
    questions: [implicitQuestionId],     
  };
  return new Exercise(viewerQuestionExerciseData);
}

module.exports = {
  generateNewSession,
  retrieveUserByUserId,
  generateImplicitQuestion,
  generateViewerQuestionExercise,
}