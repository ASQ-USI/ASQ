/**
  @fileoverview tests for models/slideshow.js for ASQ
**/

var config    = require('../config')
  , mongoose  = require('mongoose');

// mongodb connection (Global)  
db = mongoose.createConnection(config.host, config.dbName);

var should = require('chai').should()
  , schemas  = require('../models')

var mongooseFixtures = require('./util/mongoose-fixtures')
  , slFixtures = require('./fixtures/slideshow.fixtures')
  , ids = slFixtures.ids
  , fixtures = slFixtures.fixtures
  , Session = db.model("Session")
  , Slideshow = db.model("Slideshow")
  , Question = db.model("Question")
  , QuestionOption = db.model("QuestionOption");


describe('Slideshow model:', function() {
  describe('a new slideshow', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) done(err);
        done();
      });
    });

    it('should have a valid owner', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithInvalidOwner);
      slideshow.save(function(err, saved){
        should.exist(err)
        err.message.should.equal('Owner field must be a real User _id');
        done();
      });
    });

    it('should have valid questions', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithInvalidQuestions);
      slideshow.save(function(err, saved){
        should.exist(err);
        err.message.should.equal('All question items should have a real Question _id');
        done();
      });
    });

    it('should have valid questionsPerSlide', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithMoreQThanQPerSlides);

      slideshow.save(function(err, saved){
        should.exist(err);
        err.message.should.equal(ids.question3Id + ' was found in questions'
          + ' but not in the questionsPerSlide array');

        var slideshow2 = new Slideshow(slFixtures.slideshowWithMoreQPerSlidesThanQ);
        slideshow2.save(function(err, saved){
          should.exist(err);
          err.message.should.equal(ids.question3Id + ' was found in questionsPerSlide'
          + ' but not in the questions array');
           done();
        });
      });
    });

    it('with at least one question, should have at least one item in questionsPerSlide', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithQButNoQPerSlides);

      slideshow.save(function(err, saved){
        should.exist(err);
        err.message.should.equal('There should be at least a '
          + 'slide with a question, since questions.length > 0');
          done();
      });
    });

    it('with 0 questions, should have 0 questionsPerSlide', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithNoQNoQPerSlides);
      slideshow.save(function(err, saved){
        should.not.exist(err);

        var slideshow2 = new Slideshow(slFixtures.slideshowWithQPerSlidesButNoQ);
        slideshow2.save(function(err, saved){
          should.exist(err);
          err.message.should.equal('There are no questions so '
          +'questionsPerSlide.length should equal 0');
          done();
        });
      });
    });

    it('with 0 questions, should have 0 statsPerSlide', function(done){
      var slideshow = new Slideshow(slFixtures.slideshowWithNoQNoSPerSlides);
      slideshow.save(function(err, saved){
        should.not.exist(err);

        var slideshow2 = new Slideshow(slFixtures.slideshowWithSPerSlidesButNoQ);
        slideshow2.save(function(err, saved){
          should.exist(err);
          err.message.should.equal('There are no questions so '
          +'statsPerSlide.length should equal 0');
          done();
        });
      });
    });
  });


  describe('removing a slideshow', function(){

    beforeEach(function(done){
      mongooseFixtures.load(fixtures, db, function(err){
        if (err) done(err);
        done();
      });
    });

    it("should remove associated sessions", function(done){
      Slideshow.findOne({_id: ids.slideshowNormalId}, function(err, slideshow){
        if (err) return done(err);
        slideshow.remove(function(err, removed){
          if(err) return done(err);
          // check if we have sessions associated with this slideshow
          Session.find({$or:[{_id: ids.session1Id} , {slides : removed._id}]}, function(err, sessions){
            if (err) return done(err);
            sessions.length.should.equal(0);
            done();
          })
        })
      })
    });

    it("should remove associated questions", function(done){
      Slideshow.findOne({_id: ids.slideshowNormalId}, function(err, slideshow){
        if (err) return done(err);
        slideshow.remove(function(err, removed){
          if(err) return done(err);
          // check if we have questions associated with this slideshow
          Question.find({_id : {$in : removed.questions}}, function(err, questions){
            if (err) return done(err);
            questions.length.should.equal(0);
            done();
          })
        })
      }) 
    });

    it.skip("should remove associated answers", function(done){});
    it.skip("should remove associated whitelists", function(done){});

    it("should fail if the slideshow is live", function(done){
      Slideshow.findOne({_id: ids.slideshowLiveId}, function(err, slideshow){
        if (err) return done(err)
        slideshow.remove(function(err, tade){
          should.exist(err);
          err.message.should.equal('This presentation is being broadcast and cannot be '
          + 'removed.')
          done();
        })
      })
    });

  });
});
