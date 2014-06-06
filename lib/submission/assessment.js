var dust = require('dustjs-linkedin')
, when   = require('when')
, Rubric = db.model('Rubric');

function _populateRubrics(exercise) {
  var questionIds = exercise.questions.map(function(q) { return q._id; });
  return Rubric.find({ question : { $in: questionIds } }).lean().exec().then(
    function onRubrics(rubrics) {
      var i = rubrics.length
      , questions = exercise.questions, j, question;
      while(i--) {
        j = questions.length;
        while(j--) {
          question = questions[j];
          // Found question for rubric
          if (question._id.equals(rubrics[i].question)) {
            if (! (question.rubrics instanceof Array)) {
              question.rubrics = [rubrics[i]];
            } else {
              question.rubrics.push(rubrics[i]);
              break;
            }
          }
        }
      }
      // Remove questions without rubrics
      j = questions.length;
      while(j--) {
        if (! exercise.questions[j].rubrics){
          exercise.questions.splice(j, 1);
        }
      }
      return exercise;
    }, function onError(err) {
      return when.reject(err);
    });
}

function renderAssessment(exercises) {
  // Populate question with rubrics
  return when.map(exercises, function(ex) { return _populateRubrics(ex); })
    .then(function onPopulated(exercises) {
      // Render template
      var deferred = when.defer();
      dust.render('assessment-viewer', { exercises : exercises },
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
  }).then(null,
    function onError(err) { return when.reject(err); });
}

module.exports = {
  renderAssessment : renderAssessment
};