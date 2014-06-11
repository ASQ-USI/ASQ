var _  = require('lodash')
, dust = require('dustjs-linkedin')
, when = require('when');


function render(job) {
  if (job === null) {
    return when.resolve(null);
  }

  var questions = [];
  var assets = job.assets;
  var i = assets.length, asset, question;
  while(i--) {
    asset = assets[i];
    question = asset.question.toObject();
    question.submission = asset.answer.submission;
    question.confidence = asset.answer.confidence;
    question.rubrics = asset.rubrics;
    questions.push(question);
  }

  i = questions.length;
  while(i--) {
    question = questions[i];
    if (! question.submission || ! question.confidence) {
      return when.reject(new Error(
        'Assessment Render: Answer missing for question ' +
        question._id + ' from ' + job.assessee + '.'));
    }
    // Remove questions without rubrics.
    if (! question.rubrics instanceof Array || question.rubircs.length === 0) {
      questions.slice(i, 1);
    }
  }

  // Render and return the template
  var deferred = when.defer();
  dust.render({ assessee : job.assessee, exercises : [{ _id: job.exercise,
    questions : questions }]},
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

module.exports = render;