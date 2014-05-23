/* global db : true */
// require('when/monitor/console');
var _            = require('lodash')
, when           = require('when')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, appLogger      = require('./logger').appLogger
, arrayEqual     = require('./stats').arrayEqual
, AnswerModel    = require('../models/answer')
, Answer         = db.model('Answer')
, Exercise       = db.model('Exercise')
, Question       = db.model('Question');

function _saveSubmission(submissions, session, answeree, dbQuestions, dbAnswers) {
  var questions = {}
    , answers   = {};

  // Indexing questions and answers by question ids.
  var i = dbQuestions.length;
  var question, answer;
  while(i--) { // questions indexing
    question = dbQuestions[i];
    questions[question.id] = question;
  }
  i = dbAnswers.length;
  while(i--) { // answers indexing
    answer = dbAnswers[i];
    answers[answer.question] = answer;
  }

  // Handle submissions
  var hasOwn = Object.prototype.hasOwnProperty, id;
  i = submissions.length;
  while(i--) {
    answer = submissions[i];
    id = answer.question;
    if (hasOwn.call(answers, id)) {
      answers[id].submission  = answer.submission;
      answers[id].confidence  = answer.confidence;
      answers[id].correctness = questions[id].getCorrectness(answer.submission);
    } else {
      answers[id] = new Answer({
        submission  : answer.submission,
        confidence  : answer.confidence,
        correctness : answers[id].question.getCorrectness(answer.submission),
        session     : session,
        answeree    : answeree,
        question    : answer.question
      });
    }
    answers[id] = nodefn.call(answers[id].save) // replace answer with save promise
  }
  return wkeys.all(answers);
}

function process(session, token, submission) {
  return Exercise.findById(submission.id).exec().then(
    function onEx(exercise) {
      if (! exercise) {
        return when.reject(new Error(
          'Invalid submission: invalid exercise id.'));
      }
      var qIds = exercise.questions;
      // Check that the questions are in the exercise;
      var allQuestionsInEx = _.xor(qIds, submission.answers.map(function(a) {
        return a.question; })).length === 0;
      if (! allQuestionsInEx) {
        return when.reject(new Error(
          'Invalid submission: question ids are not matching.'));
      }

      // Get all the questions and existing answers
      return when.join(
        exercise, session, token,
        Question.find({ _id : { $in : qIds } }).exec(),
        Answer.find({ session : session, answeree : token,
          question : { $in: qIds } }).exec()
      );
  }).then(
    function (exercise, session, answeree, questions, answers){
      // Check for resubmissions
      if (answers.length > 0 && !exercise.allowResubmit) {
        return when.reject(new Error(
            'Invalid submission: answer already submitted.'));
      }
      return _saveSubmission(submission.answers, session, answeree, questions,
        answers);
  }).then(null,
    function onError(err) { // Log any error
      appLogger.error(err.message + '\n', { err: err.stack });
      return when.reject(err);
  });
}

module.exports = {
  process : process
};