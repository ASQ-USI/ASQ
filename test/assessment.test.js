/**
  @fileoverview tests for ASQ's assessment handling
**/

/* Tell jshint about global vars */
/* global db: true */

var chai      = require('chai')
  , sinon     = require('sinon')
  , sinonChai = require('sinon-chai')
  , expect    = chai.expect
  , mongoose  = require('mongoose')
  , config    = require('../config')
  , dust      = require('dustjs-linkedin')
  , when      = require('when');

db = mongoose.createConnection(config.mongo.mongoUri);

chai.use(sinonChai);

var assessment        = require('../lib/assessment/assessment')
  , models            = require('../models') // load all models
  , mongooseFixtures  = require('./util/mongoose-fixtures')
  , assessFixtures    = require('./fixtures/assessment.fixtures')
  , fixtures          = assessFixtures.fixtures
  , ids               = assessFixtures.ids
  , sessions          = assessFixtures.sessions
  , submissions       = assessFixtures.submissions
  , whitelist         = assessFixtures.whitelist
  , Session           = db.model('Session')
  , Answer            = db.model('Answer')
  , Question          = db.model('Question')
  , Rubric            = db.model('Rubric')
  , Slideshow         = db.model('Slideshow');

  console.log(sessions)

function defaultSetUp() {
  var deferred = when.defer();
  // var fixtures = ['Question', 'Rubric', 'Slideshow', 'User'];
  mongooseFixtures.load(fixtures, db, function(err){
    if (err) { deferred.reject(err); }
    else { deferred.resolve(true); }
  });
  return deferred.promise;
}

function defaultTearDown() {
  var deferred = when.defer();
  var models = fixtures;
  models.Assessment = {}; // Also clear assessments
  mongooseFixtures.clear(models, db, function(err){
    if (err) { deferred.reject(err); }
    else { deferred.resolve(true); }
  });
  return deferred.promise;
}

describe('assessment.queue(session, val)', function assessTest() {
  describe('with just one argument', function assessTest() {
    it('should throw an error with invalid argument number', function(){
      var error = new Error('Invalid number of arguments. Function expects\
 "session" and "val" arguments');
      //with 0 arguments
      expect(assessment.queue.bind(assessment.queue)).to
        .throw( /Invalid number of arguments/);
      //with 1 argument
      expect(assessment.queue.bind(assessment.queue), new Session(sessions[0])).to
        .throw( /Invalid number of arguments/);
    });
  });
  describe('with val as an object', function assessTest() {
    before(function(){
      sinon.spy(assessment, queueAnswer);
    })
    it.should('should call assessement.queueAnswer one time', function(){
       expect(assessment.queue.bind(assessment.queue), 
            new Session(sessions[0], new Answer(answers[1])))
      .to.not.throw();
      expect
    });
    after(function(){
      assessment.queueAnswer.restore();
    })
  });
  describe('with an array of n answers', function assessTest() {
    it.skip('should call queueAnswer n times');
  });
});