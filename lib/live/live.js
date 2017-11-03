const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const logger = require('logger-asq');
const lib = require('../index.js');
const presUtils = lib.utils.presentation;
const Slideshow = db.model('Slideshow');
const Exercise = db.model('Exercise');
const Session = db.model('Session');
const Question = db.model('Question');


const createNewLiveSession = function (ownerId, presentationId, presFlow, authLevel) {
  const flowEnumValues = Session.schema.path('flow').enumValues;
  const authLevelEnumValues = Session.schema.path('authLevel').enumValues;

  const newSession = new Session();
  newSession.presenter = ownerId;
  newSession.slides = presentationId;
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

  if(slideshow.slidesTree
     && slideshow.slidesTree.steps
     && slideshow.slidesTree.steps[0]) {

     newSession.activeSlide = slideshow.slidesTree.steps[0];
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

const createLivePresentation = coroutine(function *createLivePresentationGen(userId, presentationId, presFlow, authLevel){

  const presentation = yield Slideshow.findOne({
    _id   : presentationId,
    owner : userId })
  .exec();

  if(!presentation){
    throw new Error('No presentation with this id');
  }  // FIXME: create proper error like in list presentations

  presentation.lastSession = new Date();


  const newSession = createNewLiveSession(userId, presentationId, presFlow, authLevel);

  /* Implicit question that receives audience questions as answers */
  const implicitQuestion = createImplicitQuestion(userId, newSession._id);

  /* Instantiate viewer question Exercise */
  const viewerQuestionExercise = createViewerQuestionExercise(implicitQuestion._id);

  yield Promise.all([
    slideshow.save(),
    newSession.save(),
    implicitQuestion.save(),
    viewerQuestionExercise.save(),
  ]);

  const pFn = Promise.promisify(presUtils.generateWhitelist[newSession.authLevel]);
  yield pFn(newSession._id, user);

  return newSession;
})

module.exports = {
  createLivePresentation,
  createNewLiveSession,
  createImplicitQuestion,
  createViewerQuestionExercise,
}