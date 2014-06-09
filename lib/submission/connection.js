var _
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')

function progressOnDisconnect(session, token) {
  Answer.aggregate([
    { $match : { session: session, answeree: token } },
    { $group : { _id: '$exercise' } }
  ]).exec().then(
    function onAnswers(answers) {
      return when.all(answers.map(function updateProgress(answer) {
        AnswerProgress.getUpdateQuery(session, answer.exercise,
          { disconnected: -1 }).exec();
      }));
  }).then(null, function onError(err) {
    return when.reject(err);
  });
}

module.exports = {
 progressOnDisconnect : progressOnDisconnect
}