//models and schemas
var Answer = require('../../models/answer')
var ObjectId = require('mongoose').Types.ObjectId
var generateName    = require('sillyname')


// Random confidence: int from 1 to 5 (inclusive)
function generateConfidence () {
    return Math.floor(Math.random() * 5 + 1);
}

function generateCorrectness() {
    return Math.floor(Math.random() * 2) ? 100 : 0;
}


var ids = {
  question : ObjectId('5339f210069de6f55243d7e4'),
  session : ObjectId('5339f210069de6f55243d7e5')
}

var fixtures = {};

fixtures.Answer = Array.apply(null, new Array(25)).map( function() {
  return {
    question    : ids.question,
    answeree    : generateName(),
    session     : ids.session,
    correctness : generateCorrectness(),
    confidence  : generateConfidence()
  };
});

module.exports = {
  fixtures : fixtures,
  ids      : ids,
}