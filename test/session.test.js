/**
  @fileoverview tests for models/session.js for ASQ
**/

var config    = require('../config')
  , mongoose  = require('mongoose');

// mongodb connection (Global)  
db = mongoose.createConnection(config.host, config.dbName);

var should = require('chai').should()
  , schemas  = require('../models')

var mongooseFixtures = require('./util/mongoose-fixtures')
  , slFixtures = require('./fixtures/session.fixtures')
  , ids = slFixtures.ids
  , fixtures = slFixtures.fixtures
  , Session = db.model("Session")
  , Slideshow = db.model("Slideshow")
  , Question = db.model("Question")
  , QuestionOption = db.model("QuestionOption");


describe('Session model:', function() {

  describe('a new session', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) done(err);
        done();
      });
    });

    it.skip('should have a valid presenter', function(done){
    });

    it.skip('should have a valid presentation', function(done){
    });
  });

  describe('A saved session', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) done(err);
        done();
      });
    });

    it.skip('should have valid questionsDisplayed', function(done){
    });

    it.skip('should have valid activeQuestions', function(done){
    });

    it.skip('should have valid activeStatsQuestions', function(done){
    });

  });

  describe('removing a slideshow', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) done(err);
        done();
      });
    });

    it.skip("should remove associated answers", function(done){
    });


  });
});