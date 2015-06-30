var when = require('when');
var Assessment = db.model('Assessment');

module.exports = function correctness(questionId, sessionId) {
  var deferred = when.defer();
  var dataset = [
    { 'key' : 'right',
      '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 },
    { 'key' : 'wrong',
      '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 }
  ];

  var o = {
    query : { question: questionId, session: sessionId, type: 'auto' },
    map : function mapFn() {
      emit({ correctness: this.score, confidence: this.confidence }, 1);
    },
    reduce : function reducFn(k, vals) { return vals.length; },
    out : { inline: 1 }
  };

  Assessment.mapReduce(o)
    .then(function onMapRed(data) {
      for (var i=0; i<data.length; i++) {
        var d = data[i];
        if (1 <= d._id.confidence <= 5) { // Skip confidence outside range 1-5
          dataset[+(d._id.correctness === 0)][d._id.confidence + 'star'] += d.value;
        }
      }
      deferred.resolve(dataset);
  }, function onError(err) {
    if (err.message == 'ns doesn\'t exist') { // No answers collection
      deferred.resolve(dataset);
    } else {
      deferred.reject(err);
    }
  });
  return deferred.promise;
}