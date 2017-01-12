const SessionEvent = db.model('SessionEvent');
const Answer = db.model('Answer');
const Session = db.model('Session');
const Question = db.model('Question');
const Exercise = db.model('Exercise');
const WhitelistEntry = db.model('WhitelistEntry');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;


const handleSliderChange = function (socket, evt) {
  evt.data = evt.data || {};
  evt.data.user = socket.user._id;
  SessionEvent.create({
      session: socket.request.sessionId ,
      type: evt.type,
      data: evt.data
  });
};

const handleQuestionSubmitted = coroutine(function *handleQuestionSubmittedGen(socket, evt) {
  evt.data = evt.data || {};
  // Retrieving the current session so I can retrieve the presenter ID for retrieving the question ID
  const sessionId = socket.request.sessionId;
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
  const submissionDate = evt.submissionDate;
  const answerStartTime = evt.answerStartTime;
  const submission = evt.data;
  const type = evt.type;
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
});
module.exports = {
  handleSliderChange,
  handleQuestionSubmitted
};