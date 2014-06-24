var _            = require('lodash')
, when           = require('when')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')
, Assessment     = db.model('Assessment')
, AssessmentJob  = db.model('AssessmentJob');

function _updateProgress(session, viewer, val) {
  return when.all([
    // Existing answer from the viewer
    Answer.distinct('exercise', { session: session, answeree: viewer }).exec(),
    // Existing self assessments from the viewer
    Assessment.distinct('exercise',
      { session: session, assessor: viewer, type: 'self' }).exec(),
    // Existing peer assessment from the viewer
    Assessment.distinct('exercise',
      { session: session, assessor: viewer, type: 'peer' }).exec(),
    // Potential peer assessments of the viewer's answers
    AssessmentJob.aggregate(
      { $match: { session: session, assessee: viewer, type: 'peer',
                  status: {$in: ['pending', 'active' ]} }},
      { $group: { _id: '$exercise', total: { $sum: 1 }}}
    ).exec()
  ]).then(
    function genUpdates(data) {
      var updates = new Object(null);
      var answers = data[0];
      var self = data[1];
      var peer = data[2]
      var peerJobs = data[3].map(function(agg) {
        return {exercise: agg._id, val: agg.total }});
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
      if (peerJobs) {
        i = peerJobs.length;
        while(i--){
          if (! updates[peerJobs[i].exercise]) {
            updates[peerJobs[i].exercise] = { discPeer : val * peerJobs[i].val};
          } else if (!! updates[peerJobs[i].exercise].discPeer) {
            updates[peerJobs[i].exercise].discPeer += val * peerJobs[i].val;
          } else {
            updates[peerJobs[i].exercise].discPeer = val * peerJobs[i].val;
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