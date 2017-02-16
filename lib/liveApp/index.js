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
const handleSliderChange = coroutine(function *handleSliderChangeGen (socket, evt) {
  evt.data = evt.data || {};
  const submitterId = socket.user._id;
  const sessionId = socket.request.sessionId;
  const userData = {
    user: submitterId,
    session: sessionId,
  };

  const authorizedUser = yield WhitelistEntry
    .findOne(userData)
    .lean()
    .exec();
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return;
  evt.data.user = submitterId;
  SessionEvent.create({
      session: socket.request.sessionId ,
      type: evt.type,
      data: evt.data
  });
});

const updateSessionStudentQuestionsAndForward = coroutine(function *updateSessionStudentQuestionsAndForwardGen(sessionId) {
  const currentSession = yield Session
  .findById(sessionId)
  .lean()
  .exec();

  // Retrieving all the questions for the given session to forward to all the roles
  const studentQuestionsData = {
    type: 'student-question-submitted',
    session: sessionId,
  };

  let studentQuestions = yield Answer
    .find(studentQuestionsData)
    .lean()
    .exec();

  studentQuestions = studentQuestions.map(renameIdAndRemoveVersion);
  const data = {
    questions: studentQuestions,
  };


  const namespaces = ['folo', 'ghost'];
  const evtName = 'update-student-questions';
  socketEmitter.emit('emitToRoles', {
    evtName,
    event: {
      data,
    },
    sessionId,
    namespaces,
  });

  // We need also to update the session
  const activeViewerQuestion = currentSession.data.activeViewerQuestion;
  const sessionData = {
    activeViewerQuestion,
    viewerQuestions: studentQuestions,
  };

  currentSession.data = sessionData;
  yield Session
    .findById(sessionId)
    .update(currentSession)
    .exec();
});

const handleQuestionSubmitted = coroutine(function *handleQuestionSubmittedGen (socket, evt) {
  evt.data = evt.data || {};
  // Retrieving the current session so I can retrieve the presenter ID for retrieving the question ID
  evt.data.user = socket.user.screenName;
  const sessionId = socket.request.sessionId;
  const type = evt.type;
  const value = evt.data.value;
  const answerData = {
    type,
    'submission.value': value,
    session: sessionId,
  };
  // User who has inputed the question
  const submitterId = socket.user._id;
  const userData = {
    user: submitterId,
    session: sessionId,
  };

  const authorizedUser = yield WhitelistEntry
    .findOne(userData)
    .lean()
    .exec();
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return;

  const questionAlreadyMade = yield Answer
    .findOne(answerData)
    .lean()
    .exec();

  if (questionAlreadyMade) {
    questionId = questionAlreadyMade._id
    const data = {
      upvote: true,
      questionId,
    };
    evt.data = data;
    // If the question was already made then we treat it as and upvote
    this.handleQuestionRated(socket, evt);
    return;
  }

  const currentSession = yield Session
    .findById(sessionId)
    .lean()
    .exec();

  const presenterId = currentSession.presenter;
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

  const exerciseData = {
    stem: 'dummyExercise',
    questions: [implicitQuestion._id],
  };

  const dummyExercise = yield Exercise
    .findOne(exerciseData)
    .lean()
    .exec();

  const submissionDate = evt.submissionDate;
  const answerStartTime = evt.answerStartTime;
  const submission = evt.data;
  const newAnswerData = {
    exercise: dummyExercise._id,
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
  this.updateSessionStudentQuestionsAndForward(sessionId);
});

const handleQuestionRated = coroutine(function * handleQuestionRatedGen(socket, evt){
  evt.data = evt.data || {};
  const sessionId = socket.request.sessionId;
  const userId = socket.user._id;
  const userData = {
    user: userId,
    session: sessionId,
  };
  const authorizedUser = yield WhitelistEntry
    .findOne(userData)
    .lean()
    .exec();
  // There was no entry means the user is unauthorized
  if (!authorizedUser) return;
  // retrieving the question that was upvoted
  const studentQuestionId = evt.data.questionId;
  const studentQuestion = yield Answer
    .findById(studentQuestionId)
    .lean()
    .exec();

  let upvotes = studentQuestion.upvotes.toString().split(',');
  let downvotes = studentQuestion.downvotes.toString().split(',');
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

  const studentQuestionData = {
    upvotes,
    downvotes,
  };
  const dbStudentQuestion = yield Answer
    .findById(studentQuestionId)
    .update(studentQuestionData)
    .exec();

  const dbUpdatedStudentQuestion = yield Answer
    .findById(studentQuestionId)
    .lean()
    .exec();
  dbUpdatedStudentQuestion.id = dbUpdatedStudentQuestion._id;
  delete dbUpdatedStudentQuestion._id;
  const namespaces = ['ctrl', 'folo', 'ghost'];
  const evtName = 'student-question-rated';
  const data = {
    question: dbUpdatedStudentQuestion,
  };
  socketEmitter.emit('emitToRoles', {
    evtName,
    event: {
      data,
    },
    sessionId,
    namespaces,
  });
  this.updateSessionStudentQuestionsAndForward(sessionId);
});
module.exports = {
  handleSliderChange,
  updateSessionStudentQuestionsAndForward,
  handleQuestionSubmitted,
  handleQuestionRated,
};