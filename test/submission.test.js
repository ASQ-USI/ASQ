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
, submissionProcess = require('../lib/submission').process
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

describe('submission.process(session, token, submission)', function submitTest() {
  describe('with mismatching question ids', function mismatchQIds() {
    before(function before(done) {
      defaultSetUp().then(function(){ done(); }, function(err) { done(err); });
    })
    it('should reject with the correct error', function assertReject(done){
      submissionProcess(sessions.missmatch, token, submissions.missmatch).then(
        function onSuccess() {
          done(new Error('should not terminate successfully.'));
        }, function onError(err) {
          expect(err).to.be.an.instanceof(Error);
          expect(err.message).to.equal('Invalid submission: question ids are not matching.');
          done();
        })
    });
  });
  describe('with invalid re-submissions', function resubmit() {
    it.skip('should reject with the correct error', function assertReject(done){
    });
    it.skip('should not save any answer in the db', function assertDb(done) {
    });

  });
  describe('with a valid submission without assessment', function valid() {
    it.skip('should terminate successfully', function assertSuccess(done) {
    });
    it.skip('should save the answers in the db', function assertDb(done) {
    });
  });
  describe('with a valid submission with self-assessment', function valid() {
    it.skip('should terminate successfully', function assertSuccess(done) {
    });
    it.skip('should save the answers in the db', function assertDb(done) {
    });
  });
  describe('with a valid submission with peer-assessment', function valid() {
    it.skip('should terminate successfully', function assertSuccess(done) {
    });
    it.skip('should save the answers in the db', function assertDb(done) {
    });
  });
});