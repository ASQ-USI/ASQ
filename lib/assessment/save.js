var when = require('when')
, Assessment     = db.model('Assessment');

function _savePromise(assessment) {
  var defer = when.defer();
  assessment.save(function (err) {
    if (err) { defer.reject(err); }
    else { defer.resolve(assessment); }
  });
  return defer.promise;
}

function save(session, assessment, assessor) {
  var err = null;
  if (! assessment.exercise) {
    err = new Error('Missing exercise');
  } else if (assessment.questions.length < 1) {
    err = new Error('Empty assessment');
  } else if (! assessment.assessee) {
    err = new Error('Missing assessee');
  } else if (! assessment.questions instanceof Array) {
    err = new Error('Missing or invalid assessment');
  }
  var j, question, rubric;
  var questions = assessment.questions;
  var i = assessment.questions.length;
  while(i--) {
    if (err !== null) {
      break;
    }
    question = questions[i];
    if (! question.rubric instanceof Array) {
      err = new Error('Missing or invalid rubrics for question ' + i);
    } else if (! question.answer) {
      err = new Error('Missing answer reference.');
    }

    question.confidence = ~~question.confidence // convert to number (default to 0)

    j = question.rubrics.length;
    while(j--) {
      if (err !== null) {
        break;
      }
      rubric = question.rubrics[j];
      if (! rubric.id) {
        err = new Error('Missing rubric reference for rubric ' + j +
          '(question ' + i + ')');
      } else if (! rubric.submission instanceof Array) {
        err = new Error('Missing or invalid submission for rubric ' + j +
          '(question ' + i + ')');
      }

      rubric.score = ~~rubric.score // convert to number (default to 0)
    }
  }

  // Check rubric.id rubric.submission

  if (err !== null) { // Throw error if there is one
    process.nextTick(function onError() { throw err; });
    return;
  }

  var assessments = [];
  var type = assessment.assessee === assessor.toString() ? 'self' : 'peer';
  questions = assessment.questions;
  i = questions.length;
  while(i--) {
    question = questions[i];
    var j = question.rubrics.length;
    while(j--) {
      rubric = question.rubrics[j];
      var newAssessment = new Assessment({
        session    : session,             // Session id
        exercise   : assessment.exercise, // Exercise id
        rubric     : rubric.id,           // Rubric id
        answer     : question.answer,     // Answer id
        assessor   : assessor,            // Assessor
        assessee   : assessment.assessee, // Assessee
        score      : rubric.score,        // User given score for the answer
        confidence : question.confidence, // Confidence
        status     : 'finished',          // Submitted assessment, so it's done.
        type       : type,                // Type of assessment (self or peer)
        submission : rubric.submission,   // User submission
      });
      console.log(newAssessment);
      assessments.push(_savePromise(newAssessment));
    }
  }
  return when.all(assessments);
}

module.exports = save;