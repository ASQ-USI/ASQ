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
  , seFixtures = require('./fixtures/session.fixtures')
  , ids = seFixtures.ids
  , fixtures = seFixtures.fixtures
  , Session = db.model("Session")
  , Slideshow = db.model("Slideshow")
  , Question = db.model("Question")
  , QuestionOption = db.model("QuestionOption");


describe('Session model:', function() {

  describe('a new session', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) {
          done(err);
        }
        done();
      });
    });

    it('should have a valid presenter', function(done){
      //invalid presenter
      var sessionInvalid = new Session(seFixtures.sessionWithInvalidPresenter);
      sessionInvalid.save(function(err, saved){
        should.exist(err)
        err.message.should.equal('Presenter field must be a real User _id')

        //valid presenter
        var sessionvalid = new Session(seFixtures.sessionWithValidPresenter);
        sessionvalid.save(function(err, saved){
          should.not.exist(err)
          saved.presenter.should.equal(ids.owner1Id)
          done();
        });
      });
    });

    it('should have a valid presentation', function(done){
      //invalid presentation
      var sessionInvalid = new Session(seFixtures.sessionWithInvalidPresentation);
      sessionInvalid.save(function(err, saved){
        should.exist(err)
        err.message.should.equal('Slides field must be a real Slideshow _id')

        //valid presentation
        var sessionvalid = new Session(seFixtures.sessionWithValidPresentation);
        sessionvalid.save(function(err, saved){
          should.not.exist(err)
          saved.slides.should.equal(ids.slideshowNormalId)
          done();
        });
      });
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