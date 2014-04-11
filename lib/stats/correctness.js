var when = require('when')
, Answer = db.model('Answer');

module.exports = function correctness(questionId, sessionId) {
  var deferred = when.defer();
  var dataset = [
    { 'key' : 'right',
      '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 },
    { 'key' : 'wrong',
      '5star': 0, '4star': 0, '3star': 0, '2star': 0, '1star': 0 }
  ];

  var o = {
    query : { question: questionId, session: sessionId },
    map : function mapFn() { 
      emit({ correctness: this.correctness, confidence: this.confidence }, 1);
    },
    reduce : function reducFn(k, vals) { return vals.length; },
    out : { inline: 1 }
  };

  Answer.mapReduce(o)
    .then(function onMapRed(data) {
      for (var i=0; i<data.length; i++) {
        var d = data[i];
        dataset[+(d._id.correctness === 0)][d._id.confidence + 'star'] += d.value;
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