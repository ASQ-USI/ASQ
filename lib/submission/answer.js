/* global db : true */
const _ = require('lodash');
const Promise = require('bluebird');
const logger = require('logger-asq');

const arrayEqual = require('../stats').arrayEqual;
const AnswerModel = require('../../models/answer');
const Answer = db.model('Answer');
const AnswerProgress = db.model('AnswerProgress');
const Exercise = db.model('Exercise');
const Question = db.model('Question');

/**
 *  Small utility function to verify 2 arrays of ObjectIds have the same ids.
 */
function _sameIds(a, b) {
  if (a.length !== b.length) {
    return false;
  }
  var i = a.length, j, ok;
  while(i--) {
    ok = false
    j = b.length;
    while(j--) {
      if (a[i].equals(b[j])) {
        ok = true;
        break;
      }
    }
    if (! ok) {
      return false;
    }
  }
  return true;
}

function _validateSubmission(submission, questions) {
  var idsToCheck = [];
  var i = submission.answers.length, answer;
  while(i--) {
    answer = submission.answers[i];
    // Check question ref
    if (! answer.question) {
      return new Error('Invalid submission: Answer without ref to question.');
    }
    // Check submission
    if (! (answer.submission instanceof Array)) {
      return new Error('Invalid submission: For answer: ' + answer.question +
        ', missing or invalid submission.');
    }
    // Check confidence
    if (typeof answer.confidence !== 'number' || 0 > answer.confidence ||
      answer.confidence > 5) {

      return new Error('Invalid confidence: For answer: ' + answer.question +
        ', missing or invalid confidence.');
    }
    idsToCheck.push(answer.question);
  }
  // Check questions refs to exercise
  if (! _sameIds(questions, idsToCheck)) {
    return new Error(
      'Invalid submission: question ids are not matching the exercise.');
  }
  return null;
}

function _saveAnswerAndPopulate(answer) {
  return answer.save()
    .then(function(){
      return answer.populate('question').execPopulate();
    });
}

function _saveSubmission(session, exercise, answeree, submissions, dbQuestions, dbAnswers) {
  var questions = {}
    , answerMap   = {};
  // Indexing questions and answers by question ids.
  var i = dbQuestions.length;
  var question, answer;
  while(i--) { // questions indexing
    question = dbQuestions[i];
    questions[question._id] = question;
  }
  i = dbAnswers.length;
  while(i--) { // answers indexing
    answer = dbAnswers[i];
    answerMap[answer.question] = answer;
  }

  // Handle submissions
  var hasOwn = Object.prototype.hasOwnProperty, id;
  var update = false;
  i = submissions.length;
  while(i--) {
    answer = submissions[i];
    id = answer.question;
    if (hasOwn.call(answerMap, id)) {
      answerMap[id].submission  = answer.submission;
      answerMap[id].confidence  = answer.confidence;
    } else {
      answerMap[id] = new Answer({
        submission  : answer.submission,
        confidence  : answer.confidence,
        session     : session,
        answeree    : answeree,
        exercise    : exercise,
        question    : answer.question
      });
      if (! update) {
        update = true
      }
    }
    // replace answer with save promisified to return the saved document
    answerMap[id] = _saveAnswerAndPopulate(answerMap[id]);
  }
  var progress;
  if (update) {
    progress = AnswerProgress.update(session, exercise, { answers: 1});
  } else {
    progress = AnswerProgress.findOne({ session: session, exercise: exercise }).exec();
  }
  return Promise.join(Promise.props(answerMap), progress);
}

// Takes a session, a user token and a submission and saves it in the db.
// The function returns a array of 5 items:
// 0. The exercise for which the function was saved
// 1. The array of answers which were saved in the db.
// 2. The progress object updated after the submission.
// 3. A boolean value to indicate if the exercise requires self-assessment
// 4. A boolean value to indicate if the exercise requires peer-assessment
function save(session, token, submission) {
  if (! submission) {
    return Promise.reject(new Error('Invalid submission: missing data.'));
  }
  return Exercise.findById(submission.id).exec().then(
    function onEx(exercise) {
      if (! exercise) {
        return Promise.reject(new Error(
          'Invalid submission: invalid exercise id.'));
      }
      var qIds = exercise.questions;

      // Validate submission from server;
      var validationError = _validateSubmission(submission, qIds);
      if (validationError !== null) {
        return Promise.reject(validationError);
      }
      // Get all the questions and existing answers
      return Promise.join(
        exercise, session, token,
        Question.find({ _id : { $in : qIds } }).lean().exec(),
        Answer.find({ session : session._id, answeree : token,
          question : { $in: qIds } }).exec()
      );
  }).then(
    function saveAndUpdateCount(data){
      var exercise = data[0]
      , session    = data[1]
      , answeree   = data[2]
      , questions  = data[3]
      , answers    = data[4];
      // Check for resubmissions
      if (answers.length > 0 && ! exercise.allowResubmit) {
        return Promise.reject(new Error(
            'Invalid submission: answer already submitted.'));
      }
      return Promise.all([
        exercise,
        questions,
        // Save the answers in the db.
        _saveSubmission(session._id, exercise._id, answeree, submission.answers,
          questions, answers),
        exercise.assessmentTypes.indexOf('self') > -1,
        exercise.assessmentTypes.indexOf('peer') > -1
      ]);
  }).then(function onSave(data) {
      return Promise.resolve([
        data[0],               // exercise
        data[1],               // questions (as object)
        data[2][0],            // answers
        data[2][1].toObject(), // progress (as object)
        data[3],               // self-assessment (boolean)
        data[4]                // peer-assessment (boolean)
      ]);
  }, function onError(err) { // Log any error
      logger.error(err.message + '\nStack:\n', { err: err.stack });
      return Promise.reject(err);
  });
}

module.exports = {
  save : save
};