/**
  @fileoverview tests for ASQ's answer submission handling
**/

/* Tell jshint about global vars */
/* global app: true */
/* global after: true */
/* global before: true */
/* global db: true */
/* global it: true */
/* global  describe: true */
/* global  __dirname: true */

var chai    = require('chai')
, sinon     = require('sinon')
, sinonChai = require('sinon-chai')
, expect    = chai.expect
, mongoose  = require('mongoose')
, config    = require('../config')
, dust      = require('dustjs-linkedin')
, fs        = require('fs')
, path      = require('path')
, rimraf    = require('rimraf')
, when      = require('when');

db = mongoose.createConnection(
  config.mongoDBServer,
  config.dbName,
  config.mongoDBPort
);

chai.use(sinonChai);

var models          = require('../models') // load all models
, mongooseFixtures  = require('./util/mongoose-fixtures')
, submitFixtures    = require('./fixtures/submission.fixtures')
, fixtures          = submitFixtures.fixtures
, ids               = submitFixtures.ids
, sessions          = submitFixtures.sessions
, submissions       = submitFixtures.submissions
, token             = submitFixtures.token
, saveAnswer        = require('../lib/submission/answer').save
, Answer            = db.model('Answer')
, Question          = db.model('Question')
, Rubric            = db.model('Rubric')
, Slideshow         = db.model('Slideshow');

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
  mongooseFixtures.clear(models, db, function(err){
    if (err) { deferred.reject(err); }
    else { deferred.resolve(true); }
  });
  return deferred.promise;
}

describe('submission.answer.save(session, token, submission)', function submitTest() {
  describe('with mismatching question ids', function mismatchQIds() {
    before(function before(done) {
      defaultSetUp().then(function(){ done(); }, function(err) { done(err); });
    });
    it('should reject with the correct error', function assertReject(done){
      saveAnswer(sessions.missmatch, token, submissions.missmatch).then(
        function onSuccess() {
          done(new Error('should not terminate successfully.'));
        }, function onError(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal(
            'Invalid submission: question ids are not matching.');
          done();
        });
    });
    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });

  describe('with invalid re-submissions', function resubmit() {
    before(function before(done) {
      defaultSetUp().then(function(){ done(); }, function(err) { done(err); });
    });
    it('should reject with the correct error', function assertReject(done) {
      saveAnswer(sessions.resubmit, token, submissions.resubmit).then(
        function onSuccess() {
          done(new Error('should not terminate successfully.'));
        }, function onError(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal(
            'Invalid submission: answer already submitted.');
          done();
      });
    });
    it('should not save any answer in the db', function assertDb(done) {
      Answer.count({
        question : { $in : ids.resubmit.questions },
        submission : { $elemMatch : { $regex: /^submission-resubmit-\d/ } }
      }, function onCount(err, total) {
        if (err) {
          done(err);
        } else if (total !== 0) {
          done(new Error(total + ' answers were incorrectly saved.'));
        } else {
          done();
        }

      });
    });
    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });

  describe('with a valid submission without assessment', function valid() {
    var data = null
    , error  = null;
    before(function before(done) {
      defaultSetUp().then(
        function runTest() {
          saveAnswer(sessions.plain, token, submissions.plain).then(
            function onSuccess(out) { data = out; done(); },
            function onError(err) { error = err; done(); }
          );
        }, function setupFailure(err) {
          done(err);
      });
    });
    it('should terminate successfully', function assertSuccess() {
      expect(error).to.be.null;
      expect(data).to.be.an.instanceof(Array);
      expect(data).to.have.length(5);
      expect(data[0].constructor.modelName).to.be.equal('Exercise')
      // expect(data[1].constructor.modelName).to.be.equal('Answer')
      expect(data[2].constructor.modelName).to.be.equal('AnswerProgress')
    });
    it('should not have self- or peer-assessment enabled',
      function assertAssessment() {
        // Self
        expect(data[3]).to.be.false;
        // Peer
        expect(data[4]).to.be.false;
    });
    it('should save the answers in the db', function assertDb(done) {
      Answer.count({
        question : { $in : ids.plain.questions },
        submission : { $elemMatch : { $regex: /^submission-plain-\d/ } }
      }, function onCount(err, count) {
          if (err) {
            done(err)
          } else if (count !== 3 ) {
            done(new Error('Expected 3 questions to be saved, got: ' + count));
          } else {
            done();
          }
      });
    });
    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });

  describe('with a valid submission with self-assessment', function valid() {
    var data = null
    , error  = null;
    before(function before(done) {
      defaultSetUp().then(
        function runTest(){
          saveAnswer(sessions.self, token, submissions.self).then(
            function onSuccess(out) { data = out; done(); },
            function onError(err) { error = err; done(); }
          );
        }, function setupFailure(err) {
          done(err);
      });
    });
    it('should terminate successfully', function assertSuccess() {
      expect(error).to.be.null;
      expect(data).to.be.an.instanceof(Array);
      expect(data).to.have.length(5);
      expect(data[0].constructor.modelName).to.be.equal('Exercise')
      // expect(data[1].constructor.modelName).to.be.equal('Answer')
      expect(data[2].constructor.modelName).to.be.equal('AnswerProgress')
    });
    it('should have self-assessment only enabled',
      function assertAssessment() {
        // Self
        expect(data[3]).to.be.true;
        // Peer
        expect(data[4]).to.be.false;
    });
    it('should save the answers in the db', function assertDb(done) {
      Answer.count({
        question : { $in : ids.self.questions },
        submission : { $elemMatch : { $regex: /^submission-self-\d/ } }
      }, function onCount(err, count) {
          if (err) {
            done(err)
          } else if (count !== 3 ) {
            done(new Error('Expected 3 questions to be saved, got: ' + count));
          } else {
            done();
          }
      });
    });
    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });

  describe('with a valid submission with peer-assessment', function valid() {
    var data = null
    , error  = null;
    before(function before(done) {
      defaultSetUp().then(
        function runTest(){
          saveAnswer(sessions.peer, token, submissions.peer).then(
            function onSuccess(out) { data = out; done(); },
            function onError(err) { error = err; done(); }
          );
        }, function setupFailure(err) {
          done(err);
      });
    });
    it('should terminate successfully', function assertSuccess() {
      expect(error).to.be.null;
      expect(data).to.be.an.instanceof(Array);
      expect(data).to.have.length(5);
      expect(data[0].constructor.modelName).to.be.equal('Exercise')
      // expect(data[1].constructor.modelName).to.be.equal('Answer')
      expect(data[2].constructor.modelName).to.be.equal('AnswerProgress')
    });
    it('should have peer-assessment only enabled',
      function assertAssessment() {
        // Self
        expect(data[3]).to.be.false;
        // Peer
        expect(data[4]).to.be.true;
    });
    it('should save the answers in the db', function assertDb(done) {
      Answer.count({
        question : { $in : ids.peer.questions },
        submission : { $elemMatch : { $regex: /^submission-peer-\d/ } }
      }, function onCount(err, count) {
          if (err) {
            done(err)
          } else if (count !== 3 ) {
            done(new Error('Expected 3 questions to be saved, got: ' + count));
          } else {
            done();
          }
      });
    });
    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });
});