var when = require('when')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')

function _updateProgress(session, token, update, options) {
  return Answer.aggregate([
    { $match : { session: session, answeree: token } },
    { $group : { _id: '$exercise' } }
  ]).exec().then(
    function onAnswers(answers) {
      return when.all(answers.map(function updateProgress(answer) {
        AnswerProgress.getUpdateQuery(session, answer.exercise, update,
          options).exec();
      }));
  }).then(null, function onError(err) {
    return when.reject(err);
  });
}

function updateConnect(session, token) {
  return _updateProgress(session, token, { disconnected: -1 });
}

function updateDisconnect(session, token) {
  return _updateProgress(session, token, { disconnected: 1 });
}

module.exports = {
 updateConnect    : updateConnect,
 updateDisconnect : updateDisconnect
}