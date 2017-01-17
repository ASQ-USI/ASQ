const SessionEvent = db.model('SessionEvent');
const Answer = db.model('Answer');
const Session = db.model('Session');
const Question = db.model('Question');
const Exercise = db.model('Exercise');
const WhitelistEntry = db.model('WhitelistEntry');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const _ = require('lodash');

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
  evt.data.user = socket.user.screenName;
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
  const studentQuestion = evt.data.question;
  const studentQuestionId = studentQuestion.id;
  let upvotes = studentQuestion.upvotes;
  let downvotes = studentQuestion.downvotes;
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
  // TODO: Notify all the roles about the update, through the answer schema hook or already here by using emito to roles?
});
module.exports = {
  handleSliderChange,
  handleQuestionSubmitted,
  handleQuestionRated,
};