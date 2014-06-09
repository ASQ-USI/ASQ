var _  = require('lodash')
, dust = require('dustjs-linkedin')
, when = require('when');


function render(job) {
  if (job === null) {
    return null;
  }
  var questions = _.groupBy(job.questions, '_id');
  var answers = _.groupBy(job.answers, 'question');
  var rubrics = _.groupBy(job.rubrics, 'question');
  var hasOwn = Object.hasOwnProperty;
  var qId;

  // Populate questions with answers
  var i = answers.length, rubric, answer, qId;
  while(i--) {
    answer = answers[i];
    qId = answers.question;
    if (hasOwn.call(questions, qId)) {
      questions[qId].submission = answer.submission;
      questions[qId].confidence = answer.confidence;
    }
  }

  // Populate questions with rubrics
  i = rubrics.length;
  while(i--) {
    rubric = rubrics[i];
    qId = rubric.question;
    if (hasOwn.call(questions, qId)) {
      if (! questions[qId].rubrics || typeof questions[qId].rubrics !== Array) {
        questions[qId].rubrics = [rubric,];
      } else {
        questions[qId].rubrics.push(rubric);
      }
    }
  }

  // Render and return the template
  var deferred = when.defer();
  dust.render({ assesse : job.assesse, exercises : [
    { _id       : job.exercise._id,
      questions : Object.keys(questions).map(function(q) {
        return questions[q];
      })
    }]},
    function onRender(err, out) {
      if (err) {
        deferred.reject(err);
      } else if (! out) {
        deferred.reject(new Error(
          'No output when generating the assessment HTML for exercises.'));
      } else {
        deferred.resolve(out);
      }
  });
  return deferred.promise;
}