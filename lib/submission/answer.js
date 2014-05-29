/* global db : true */
// require('when/monitor/console');
var _            = require('lodash')
, when           = require('when')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, appLogger      = require('../logger').appLogger
, arrayEqual     = require('../stats').arrayEqual
, AnswerModel    = require('../../models/answer')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')
, Exercise       = db.model('Exercise')
, Question       = db.model('Question');

function _arrayEquals(a, b) {
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

function _saveSubmission(session, exercise, answeree, submissions, dbQuestions, dbAnswers) {
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
  var update = false;
  i = submissions.length;
  while(i--) {
    answer = submissions[i];
    id = answer.question;
    if (hasOwn.call(answers, id)) {
      answers[id].submission  = answer.submission;
      answers[id].confidence  = answer.confidence;
      answers[id].correctness = 42;
    } else {
      answers[id] = new Answer({
        submission  : answer.submission,
        confidence  : answer.confidence,
        correctness : 42,
        session     : session,
        answeree    : answeree,
        exercise    : exercise,
        question    : answer.question
      });
      if (! update) {
        update = true
      }
    }
    answers[id] = nodefn.call(answers[id].save.bind(answers[id])) // replace answer with save promise
  }
  var progress;
  if (update) {
    progress = AnswerProgress.getUpdateQuery(session, exercise, { answers: 1 },
      { upsert: true });
  } else {
    progress = AnswerProgress.findOne({ session: session, exercise: exercise });
  }
  return when.join(wkeys.all(answers), progress.exec());
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
    return when.reject(new Error('Invalid submission: missing data.'));
  }
  return Exercise.findById(submission.id).exec().then(
    function onEx(exercise) {
      if (! exercise) {
        return when.reject(new Error(
          'Invalid submission: invalid exercise id.'));
      }
      var qIds = exercise.questions;

      // Check that the questions are in the exercise;
      var allQuestionsInEx = _arrayEquals(qIds,
        submission.answers.map(function(a) { return a.question; })
      );
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
    function saveAndUpdateCount(data){
      var exercise = data[0]
      , session    = data[1]
      , answeree   = data[2]
      , questions  = data[3]
      , answers    = data[4];
      // Check for resubmissions
      if (answers.length > 0 && ! exercise.allowResubmit) {
        return when.reject(new Error(
            'Invalid submission: answer already submitted.'));
      }

      return when.all([
        exercise,
        // Save the answers in the db.
        _saveSubmission(exercise._id, session._id, answeree, submission.answers,
          questions, answers),
        exercise.assessment.indexOf('self') > -1,
        exercise.assessment.indexOf('peer') > -1
      ]);
  }).then(function onSave(data) {
      return when.resolve([
        data[0],    // exercise
        data[1][0], // answers
        data[1][1], // progress
        data[2],    // self-assessment (boolean)
        data[3]     // peer-assessment (boolean)
      ]);
  }, function onError(err) { // Log any error
      appLogger.error(err.message + '\n', { err: err.stack });
      return when.reject(err);
  });
}

module.exports = {
  save : save
};