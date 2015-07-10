var chai      = require('chai')
  , sinon     = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect    = chai.expect
  , mongoose  = require('mongoose')
  , config    = require('../config');

db = mongoose.createConnection(config.mongo.mongoUri);

  var mongooseFixtures = require('./util/mongoose-fixtures')
  , answerFixtures     = require('./fixtures/answers.fixtures')
  , ids                = answerFixtures.ids
  , fixtures           = answerFixtures.fixtures
  , Answer             = db.model('Answer')
  , stats              = require('../lib/stats');

chai.use(sinonChai);
var expected = null;

function beforeHook(done) {
  expected = [
    { 'key' : 'right', '5star' : 0, '4star' : 0, '3star' : 0, '2star' : 0, '1star' : 0 },
    { 'key' : 'wrong', '5star' : 0, '4star' : 0, '3star' : 0, '2star' : 0, '1star' : 0 },
  ];
  var fixAnswers = fixtures.Answer;
  for (var i= 0; i < fixAnswers.length; i++) {
    expected[+(fixAnswers[i].correctness === 0)][fixAnswers[i].confidence + 'star']++;
  }
  mongooseFixtures.load(fixtures, db, function onPopulated(err){
    if (err) {
      done(err);
      return;
    }
    done();
  });
}

describe('stats.correctness(questionId, sessionId)', function onTest() {
  before(beforeHook);
  var output = null;
  var jsonSpy = null;
  it('Should resolve with a non null JSON array', function onRun(done) {
    stats.correctness(ids.question, ids.session).then(
      function onResolved(data) {
        output = data;
        expect(output).not.to.be.null;
        done();
      }, function onErr(err) { done(err); });
  });
  it('Should return a JSON array of length 2.', function onLength() {
    expect(output).to.have.length(2);
  });
  it('Should return the correct values for each elem. in the array.',
    function onCorrect() {
      expect(output).to.deep.equal(expected);
  });
});