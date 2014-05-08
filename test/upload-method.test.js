/**
  @fileoverview tests for ASQ's slideshow upload handling
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

var models           = require('../models')
, dustHelpers        = require('../lib/dust-helpers')
, microformat        = require('asq-microformat')
, mongooseFixtures   = require('./util/mongoose-fixtures')
, uploadFixtures     = require('./fixtures/upload-method.fixtures')
, ids                = uploadFixtures.ids
, fixtures           = uploadFixtures.fixtures
, reqs               = uploadFixtures.reqs
, uploadPresentation = require('../routes/user/presentations/handlers')
  .uploadPresentation
, Question           = db.model('Question')
, Rubric             = db.model('Rubric')
, Slideshow          = db.model('Slideshow');

// Dust setup for rendering of templates (in the markup generator)
dust.optimizers.format = function(ctx, node) { return node };
require('dustjs-helpers');
dustHelpers(dust);
microformat.templates(dust);

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
  var dir = app.get('uploadDir');
  mongooseFixtures.clear(models, db, function(err){
    if (err) { deferred.reject(err); }
    else { deferred.resolve(true); }
  });
  return deferred.promise;
}

function copySlideArchive(source, target, done) {
  // Read source
  var readStream = fs.createReadStream(source, { flags: 'r',
    encoding: null,
    fd: null,
    mode: 0664,
    autoClose: true
  });

  // Write to target
  var writeStream = fs.createWriteStream(target, {
    flags    : 'w',
    encoding : null,
    mode     : 0664
  });

  // stream listeners
  readStream.on('error', function onReadErr(err) { done(err); });
  writeStream.on('error', function onWriteErr(err) { done(err); });
  writeStream.on('finish', function onCopied() { done() });

  // copy
  readStream.pipe(writeStream);
}

describe('uploadPresentation(req, res, next)', function upload() {
  describe('with an invalid slide show', function invalid() {
    var req;
    before(function setUp(done) {
      defaultSetUp().then(
      function onDefault() {
        req = reqs.invalid;

        var dirName = path.dirname(req.files.upload.path);
        var baseName = path.basename(req.files.upload.path);
        var oldPath = req.files.upload.path;
        req.files.upload.path = dirName + '/tmp-' + baseName;
        copySlideArchive(oldPath, req.files.upload.path, done);
      }, function onError(err) { done(err); });
    });

    it.skip('should fail, indicating it cannot find the HTML file',
    function chekcFailed() {});
    it.skip('should remove the uploaded zip archive',
    function checkArchiveRemoval() {});

    after(function tearDown(done) {
      defaultTearDown().then(
        function onTearDown() { done(); },
        function onError(err) { done(err); });
    });
  });

  describe('with a valid slide show', function valid() {
    var req;
    before(function setUp(done) {
      defaultSetUp().then(
      function OnDefault() {
        req = reqs.valid;

        var dirName = path.dirname(req.files.upload.path);
        var baseName = path.basename(req.files.upload.path);
        var oldPath = req.files.upload.path;
        req.files.upload.path = dirName + '/tmp-' + baseName;
        copySlideArchive(oldPath, req.files.upload.path, done);
      }, function onError(err) { done(err); });
    });

    it('should redirect to the user\'s presentations page',
    function checkRedirect(done) {
      function redirect(url) {
        // from: github.com/visionmedia/express/blob/master/lib/response.js#L668
        // allow status / url
        if (2 === arguments.length) {
          var status;
          if ('number' === typeof url) {
            status = url;
            url = arguments[1];
          } else {
            status = arguments[1];
          }
          expect(status).to.be.a('number');
          expect(status).to.equal(302); // Default redirect
        }

        expect(url).to.be.a('string');
        expect(url).to.match(
          new RegExp('^\\/' + req.user.username + '\\/presentations\\/'));
        done();
      }
      function next(err) {
        if (err && 'string' === typeof err) {
          done(new Error(err));
        } else if (err) {
          done(err);
        } else {
          done(new Error(
            'Upload handler calling next() instead of returning a response'));
        }
      }
      uploadPresentation(req, { redirect : redirect }, next);
    });

    it.skip('should extract the zip archive in the appropriate location');
    it.skip('should remove the uploaded zip archive');
    it.skip('should create a slide show entry in the database');
    it.skip('should dump the questions in the database');
    it('should dump the rubrics in the database',
    function checkRubricsDump(done) {
      Rubric.find().exec().then(function checkRubrics(rubrics) {
        expect(rubrics).to.be.instanceof(Array);
        expect(rubrics).to.have.length(2);
        var i = rubrics.length;
        while(i--) {
          var rubric = rubrics[i];
          expect(rubric).to.have.property('_type', 'Rubric');
          expect(rubric).to.have.property('questionType', 'multi-choice');
          expect(rubric).to.have.property('stemText', 'Correctness');
          expect(rubric).to.have.property('maxScore', 1);
          expect(rubric).to.have.property('formButtonType', 'radio');
          expect(rubric).to.have.property('criteria');
          var criteria = rubric.criteria;
          expect(criteria).to.be.instanceof(Array);
          expect(criteria).to.have.length(2);
          var j = criteria.length;
          while(j--) {
            var criterion = criteria[j];
            expect(criterion).to.have.property('points');
            expect(criterion).to.have.property('label');
            expect(criterion).to.have.property('desc');
          }
        }
        done();
      }, function onRubricQueryError(err) { done(err); });
    });
    it.skip('should create a presenter dust template');
    it.skip('should create a viewer dust template');

    after(function tearDown(done) {
      defaultTearDown(done).then(
        function onTearDown() {
          rimraf(app.get('uploadDir'), function onError(err) { done(err); });
        },
        function onError(err) { done(err); });
    });
  });
});