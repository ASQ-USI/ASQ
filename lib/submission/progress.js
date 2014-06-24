var _ = require('lodash')
, when = require('when')
, Assessment     = db.model('Assessment')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')

function _updateProgress(session, token, val) {
  return when.all([
    Answer.distinct('exercise', { session: session, answeree: token }).exec(),
    Assessment.distinct('exercise',
      { session: session, assessor: token, type: 'self' }).exec(),
    Assessment.distinct('exercise',
      { session: session, assessor: token, type: 'peer' }).exec(),
  ]).then(
    function genUpdates(data) {
      var updates = new Object(null);
      var answers = data[0];
      var self = data[1];
      var peer = data[2];
      var i;
      if (answers) {
        i = answers.length;
        while(i--) {
          updates[answers[i]] = { discAnswers : val };
        }
        i = self.length;
      }
      if (self) {
        while(i--) {
          if (! updates[self[i]]) {
            updates[self[i]] = { discSelf : val };
          } else {
            updates[self[i]].discSelf = val;
          }
        }
      }
      if (peer) {
        i = peer.length;
        while(i--) {
          if (! updates[peer[i]]) {
            updates[peer[i]] = { discPeer : val };
          } else {
            updates[peer[i]].discPeer = val;
          }
        }
      }
      return when.map(_.pairs(updates), function updateProgress(elem) {
        return AnswerProgress.update(session, elem[0], elem[1]);
      });
  }).then(null, function onError(err) {
    return when.reject(err);
  });
}

function updateConnect(session, token) {
  return _updateProgress(session, token, -1);
}

function updateDisconnect(session, token) {
  return _updateProgress(session, token, 1);
}

module.exports = {
 updateConnect    : updateConnect,
 updateDisconnect : updateDisconnect
}