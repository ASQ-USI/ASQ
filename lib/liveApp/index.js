const SessionEvent = db.model('SessionEvent');
const Answer = db.model('Answer');
const Session = db.model('Session');
const Question = db.model('Question');
const Exercise = db.model('Exercise');
const WhitelistEntry = db.model('WhitelistEntry');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const _ = require('lodash');
const socketEmitter  = require('../socket/pubsub');
const renameIdAndRemoveVersion = require('../utils/format').renameIdAndRemoveVersion;

/**
  Given a presenterId and a sessionId retrieves the implicit student question
  @param {ObjectId} presenterId - The id of the presenter that created the live session
  @param {ObjectId} sessionId - The id of the current ongoing session
  @return {Object} implicitQuestion - If found return the Question Object, null otherwise
*/

const retrieveImplicitQuestionByPresenterAndSession = coroutine(function*retrieveImplicitQuestionByPresenterAndSessionGen (presenterId, sessionId){
  const questionData = {
    author: presenterId, 
    type: 'asq-text-input-q',
    'data.type': 'implicit-student-question',
    'data.session': sessionId
  };

  const implicitQuestion = yield Question
    .findOne(questionData)
    .lean()
    .exec();
  return implicitQuestion;
});

/**
  Retrieves the answer to the implicit question (a.k.a the student question) with the given data
  @param {Object} data - the data of the student question
  @return {Object} question - If found return the Answer Object, null otherwise
*/

const retrieveViewerQuestionByData = coroutine(function*retrieveViewerQuestionByDataGen (data){
  const question = yield Answer
    .findOne(data)
    .lean()
    .exec();
  return question;
});

/**
  Given a sessionId retrieves the live Session
  @param {ObjectId} sessionId - The id of the current live session
  @return {Object} session - If found return the Session Object, null otherwise
*/

const retrieveSessionById = coroutine(function*retrieveSessionByIdGen (sessionId){
  const session = yield Session
    .findById(sessionId)
    .lean()
    .exec();
  return session;
});

/**
  Given a questionId retrieves the respective student question.
  @param {ObjectId} questionId - The id of the student Question
  @return {Object} viewerQuestion - If found return the Answer Object, null otherwise
*/

const retrieveViewerQuestionById = coroutine(function*retrieveViewerQuestionByIdGen (questionId){
  const viewerQuestion = yield Answer
    .findById(questionId)
    .lean()
    .exec();
  dbUpdatedViewerQuestion.id = dbUpdatedViewerQuestion._id;
  delete dbUpdatedViewerQuestion._id;
  return viewerQuestion;
});

/**
  Given a sessionId retrieves all the student questions made in that session.
  @param {ObjectId} sessionId - The id of the current ongoing session
  @return {Object[]} viewerQuestions - An array of student questions
*/


const retrieveViewerQuestionsBySessionId = coroutine(function*retrieveViewerQuestionsBySessionIdGen (sessionId){
  const data = {
    type: 'student-question-submitted',
    session: sessionId,
  };
  let questions = yield Answer
    .find(data)
    .lean()
    .exec();
  questions = questions.map(renameIdAndRemoveVersion);
  return questions
});

/**
  Given a stem and an array of Question ids retrieves the Student question Exercise
  @param {String} stem - The stem that represent the student question Exercise
  @param {ObjectId[]} questions - An array of Question ids
  @return {Object} viewerQuestionsExercise - If found return the Exercise Object, null otherwise
*/

const retrieveViewerQuestionsExerciseByStemAndQuestions = coroutine(function*retrieveViewerQuestionsExerciseByStemAndQuestionsGen (stem, questions){
  const data = {
    stem,
    questions,
  };

  const viewerQuestionsExercise = yield Exercise
    .findOne(data)
    .lean()
    .exec();
  return viewerQuestionsExercise;
});
/**
  Given a userId and a sessionId checks whether there exists a user with the userId for the
  session with the given sessionId
  @param {ObjectId} userId - The id of the user that is being searched
  @param {ObjectId} sessionId - The id of the current ongoing session
  @return {Object} - If found return the user Object, null otherwise
*/
const isUserAuthorized = coroutine(function*isUserAuthorizedGen (userId, sessionId){
  const userData = {
    user: userId,
    session: sessionId,
  };

  const user = yield WhitelistEntry
  .findOne(userData)
  .lean()
  .exec();

  return user;
});

/**
  Emit the given data through an event to the namespaces in the current session 
  @param {String} evtName - The name of the event 
  @param {ObjectId} sessionId - The id of the current ongoing session
  @param {Object} data - The data to emit
  @param {String[]} namespaces - The array of namespaces to send the data to
  @return {}
*/

const notifyRoles = function (evtName, sessionId, data, namespaces) {
  socketEmitter.emit('emitToRoles', {
    evtName,
    event: {
      data,
    },
    sessionId,
    namespaces,
  });
}

/**
  Given the sessionId updates the student questions in the Session given by the said id and notify the roles about the changes
  @param {ObjectId} sessionId - The id of the current ongoing session
  @return {}
*/

const updateSessionViewerQuestionsAndNotify = coroutine(function*updateSessionViewerQuestionsAndNotifyGen(sessionId) {
  const currentSession = yield retrieveSessionById(sessionId);
  if (!currentSession) return new Error('Session with the given id could not be found');
  // Retrieving all the questions for the given session to forward to all the roles
  let viewerQuestions = yield retrieveViewerQuestionsBySessionId(sessionId);

  const data = {
    questions: viewerQuestions,
  };


  const namespaces = ['folo', 'ghost'];
  const evtName = 'update-student-questions';
  // We need to notify the other roles about the changes
  notifyRoles(evtName, sessionId, data, namespaces);
  // We need also to update the session
  const activeViewerQuestion = currentSession.data.activeViewerQuestion;
  const sessionData = {
    activeViewerQuestion,
    viewerQuestions,
  };

  currentSession.data = sessionData;
  yield Session
    .findById(sessionId)
    .update(currentSession)
    .exec();
});

/**
  Given a socket and an event, checks whether the user is authorized
  If it's authorized it will create a session event with the event type and data
  @param {Object} socket - The connection socket
  @param {Object} evt - The event data
  @return {}
*/
const handleSliderChange = coroutine(function*handleSliderChangeGen (socket, evt) {
  evt.data = evt.data || {};
  const submitterId = socket.user._id;
  const sessionId = socket.request.sessionId;

  // checking if the user is authorized
  const authorizedUser = yield isUserAuthorized(submitterId, sessionId)
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return new Error('User is unauthorized');
  evt.data.user = submitterId;
  // Creating the session Event
  SessionEvent.create({
      session: socket.request.sessionId ,
      type: evt.type,
      data: evt.data
  });
});


/**
  Given a socket and an event, It checks whether the user that is submitting the question is authorized and checks if the question was already made.
  If it was then it will be treated as an upvote.
  If it's the first time that the question was asked then it will retrieve the necessary informations for saving the student question as an Answer, 
  and then it will be saved as an Answer model.
  Once it will be saved it will notify all the roles that a new question was made
  @param {Object} socket - The connection socket
  @param {Object} evt - The event data
  @return {}
*/

const handleSubmittedQuestion = coroutine(function*handleSubmittedQuestionGen (socket, evt) {
  evt.data = evt.data || {};
  // Retrieving the current session so I can retrieve the presenter ID for retrieving the question ID
  evt.data.user = socket.user.screenName;
  const sessionId = socket.request.sessionId;
  const type = evt.type;
  const value = evt.data.value;

  // User who has inputed the question
  const submitterId = socket.user._id;
  // checking if the user is authorized
  const authorizedUser = yield isUserAuthorized(submitterId, sessionId)
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return new Error('User is unauthorized');

  const answerData = {
    type,
    'submission.value': value,
    session: sessionId,
  };
  // checking if a question with the same type, session and value was already made
  const questionAlreadyPosed = yield retrieveViewerQuestionByData(answerData);

  if (questionAlreadyPosed) {
    questionId = questionAlreadyPosed._id
    const data = {
      upvote: true,
      questionId,
    };
    evt.data = data;
    // If the question was already made then we treat it as and upvote
    this.handleQuestionRated(socket, evt);
    return;
  }
  // retrieving the current session so I can retrieve the presenter identifier
  const currentSession = yield retrieveSessionById(sessionId);
  if (!currentSession) return new Error('Session with the given identifier was not found');
  // Retrieving the presenterId
  const presenterId = currentSession.presenter;
  // Retrieving the implicit question
  const implicitQuestion = yield retrieveImplicitQuestionByPresenterAndSession(presenterId, sessionId);
  if (!implicitQuestion) return new Error('Implicit question could not be found');

  // Retrieving the student question exercises
  const stem = 'dummyExercise';
  const questions = [implicitQuestion._id];

  const viewerQuestionsExercise = yield retrieveViewerQuestionsExerciseByStemAndQuestions(stem, questions);
  if (!viewerQuestionsExercise) return new Error('Viewer question exercise was not found');

  const submissionDate = evt.submissionDate;
  const answerStartTime = evt.answerStartTime;
  const submission = evt.data;
  // Generating the answer to save in the answer schema
  const newAnswerData = {
    exercise: viewerQuestionsExercise._id,
    question: implicitQuestion._id,
    answeree: authorizedUser._id,
    session: sessionId,
    type,
    answerStartTime,
    submissionDate,
    submission,
  };
  const newAnswer = new Answer(newAnswerData);
  newAnswer.save();

  // Session needs to be updated
  this.updateSessionViewerQuestionsAndNotify(sessionId);
});

/**
  Given a socket and an event, It checks whether the user that is submitting the question is authorized and checks if the question was already made.
  If it was then it will be treated as an upvote.
  If it's the first time that the question was asked then it will retrieve the necessary informations for saving the student question as an Answer, 
  and then it will be saved as an Answer model.
  Once it will be saved it will notify all the roles that a new question was made
  @param {Object} socket - The connection socket
  @param {Object} evt - The event data
  @return {}
*/


const handleQuestionRated = coroutine(function*handleQuestionRatedGen (socket, evt){
  evt.data = evt.data || {};
  const sessionId = socket.request.sessionId;
  const userId = socket.user._id;

  // checking if the user is authorized
  const authorizedUser = yield isUserAuthorized(userId, sessionId)
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return new Error('User is unauthorized');
  // retrieving the question that was upvoted
  const viewerQuestionId = evt.data.questionId;
  const viewerQuestion = yield retrieveViewerQuestionById(viewerQuestionId);
  if (!viewerQuestion) return new Error('Viewer question with the given id was not found');
  let upvotes = viewerQuestion.upvotes.toString().split(',');
  let downvotes = viewerQuestion.downvotes.toString().split(',');
  upvotes = upvotes.filter((val) => {return val !== ''})
  downvotes = downvotes.filter((val) => {return val !== ''})

  const userUpvoteIdx = _.indexOf(upvotes, userId.toString());
  const userAlreadyUpvoted = userUpvoteIdx !== -1;
  const userDownvoteIdx = _.indexOf(downvotes, userId.toString());
  const userAlreadyDownvoted = userDownvoteIdx !== -1;
  const isUpvote = evt.data.upvote;
  const isDownvote = evt.data.downvote;

  if (userAlreadyUpvoted && isUpvote) return;
  if (userAlreadyDownvoted && isDownvote) return;
  if (isUpvote) upvotes.push(userId);
  if (isDownvote) downvotes.push(userId);

  // If user has upvoted first and then downvoted remove it from upvotes and add it to downvotes
  if (userAlreadyUpvoted && isDownvote) 
    upvotes = [...upvotes.slice(0, userUpvoteIdx), ...upvotes.slice(userUpvoteIdx + 1)];
  // If user has downvoted first and then upvoted remove it from downvotes and add it to upvotes
  if (userAlreadyDownvoted && isUpvote) 
    downvotes = [...downvotes.slice(0, userDownvoteIdx), ...downvotes.slice(userDownvoteIdx + 1)];

  const viewerQuestionData = {
    upvotes,
    downvotes,
  };
  // Updating the question
  const dbViewerQuestion = yield Answer
    .findById(viewerQuestionId)
    .update(viewerQuestionData)
    .exec();
  // Retrieve the updated student question
  const dbUpdatedViewerQuestion = yield retrieveViewerQuestionById(viewerQuestionId);
  if (!dbUpdatedViewerQuestion) return new Error('Viewer question with the given id was not found');
  const namespaces = ['ctrl', 'folo', 'ghost'];
  const evtName = 'student-question-rated';
  const data = {
    question: dbUpdatedViewerQuestion,
  };
  // Notify the roles
  notifyRoles(evtName, sessionId, data, namespaces);
  // Update the session with the new student questions
  this.updateSessionViewerQuestionsAndNotify(sessionId);
});
module.exports = {
  notifyRoles,
  retrieveImplicitQuestionByPresenterAndSession,
  retrieveViewerQuestionsBySessionId,
  retrieveViewerQuestionByData,
  retrieveSessionById,
  retrieveViewerQuestionById,
  retrieveViewerQuestionsExerciseByStemAndQuestions,
  isUserAuthorized,
  handleSliderChange,
  updateSessionViewerQuestionsAndNotify,
  handleSubmittedQuestion,
  handleQuestionRated,
};