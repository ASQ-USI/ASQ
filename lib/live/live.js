const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const logger = require('logger-asq');
const lib = require('../index.js');
const presUtils = lib.utils.presentation;
const Slideshow = db.model('Slideshow');
const Exercise = db.model('Exercise');
const Session = db.model('Session');
const Question = db.model('Question');


const createNewLiveSession = function (ownerId, presentation, presFlow, authLevel) {
  const flowEnumValues = Session.schema.path('flow').enumValues;
  const authLevelEnumValues = Session.schema.path('authLevel').enumValues;

  const newSession = new Session();
  newSession.presenter = ownerId;
  newSession.slides = presentation._id;
  newSession.flow = ( flowEnumValues.indexOf(presFlow) > -1 ) 
    ? presFlow 
    : 'ctrl';
  newSession.authLevel = ( authLevelEnumValues.indexOf(authLevel) > -1 ) 
    ? authLevel 
    : 'public';

  /* 
    This is needed for the live app, since we need to store the active viewer
    question (the question that it's displayed to the users)
  */
  newSession.data = {
    activeViewerQuestion: null,
    questions: [],
    studentQuestionsEnabled: false,
  };
  newSession.markModified('data');

  if(presentation.slidesTree
     && presentation.slidesTree.steps
     && presentation.slidesTree.steps[0]) {

     newSession.activeSlide = presentation.slidesTree.steps[0];
  }

  return newSession;
};


const createImplicitQuestion = function (ownerId, sessionId) {
  const implicitQuestionData = {
    type: 'asq-text-input-q',
    author: ownerId,
    data: {
      description: 'Implicit question placeholder for live app student questions',
      type: 'implicit-student-question',
      session: sessionId,
    },
  };

  return new Question(implicitQuestionData);
}

const createViewerQuestionExercise = function (implicitQuestionId) {
  const viewerQuestionExerciseData = {
    stem: 'viewerQuestionExercise',
    questions: [implicitQuestionId],
  };
  return new Exercise(viewerQuestionExerciseData);
}

const createLivePresentationSession = coroutine(function *createLivePresentationSessionGen(user, presentationId, presFlow, authLevel) {

  if(!user || !user._id){
    throw new Error('No user was given for creating a live presentation');
  }

  const presentation = yield Slideshow.findOne({
    _id   : presentationId,
    owner : user._id })
  .exec();

  if(!presentation){
    throw new Error('No presentation with this id');
  }  // FIXME: create proper error like in list presentations

  presentation.lastSession = new Date();


  const newSession = createNewLiveSession(user._id, presentation, presFlow, authLevel);

  /* Implicit question that receives audience questions as answers */
  const implicitQuestion = createImplicitQuestion(user._id, newSession._id);

  /* Instantiate viewer question Exercise */
  const viewerQuestionExercise = createViewerQuestionExercise(implicitQuestion._id);

  yield Promise.all([
    presentation.save(),
    newSession.save(),
    implicitQuestion.save(),
    viewerQuestionExercise.save(),
  ]);

  const generateWhitelistFn = presUtils.generateWhitelist[newSession.authLevel];
  yield generateWhitelistFn(newSession._id, user);

  return newSession;
})

module.exports = {
  createLivePresentationSession,
  createNewLiveSession,
  createImplicitQuestion,
  createViewerQuestionExercise,
}