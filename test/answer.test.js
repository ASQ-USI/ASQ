/**
  @fileoverview test file for the model/answer.js
**/

var mongoose       = require('mongoose')
  , config          = require('../config');

// mongodb connection
db = mongoose.createConnection('127.0.0.1', config.dbName);

var chai           = require('chai')
  , chaiAsPromised = require("chai-as-promised")
  , expect         = chai.expect
  , express        = require('express')
  , _              = require('lodash')
  , passport       = require('passport')
  , path           = require('path')
  , request        = require('supertest')
  , schemas        = require('../models')
  , statistics     = require('../routes/statistics')
  , passportMock   = require('./util/mock-passport-middleware')
  , configStub     = {}


// support for promises
chai.use(chaiAsPromised);




// setup a small app for the test
var app = express();
app.get('/stats/getStats', statistics.getStats);

//saves id of created question
var questionID;

//Load required models
var Question  = db.model('Question');
var Session   = db.model('Session');
var Slideshow = db.model('Slideshow');
var Answer    = db.model('Answer');

describe('Create sample questions', function() {

	before(function(done) {
		Question.remove({}, function(err) {
			if (err) throw err;
			done();
		});
	});

	after(function(done) {
		Question.remove({}, function(err) {
			if (err) throw err;
			done();
		});
	})
	it("should create a new question", function(done) {
		//Create sample Question
		var newQuestion = new Question({
			stem : "<h3 class=\"stem\">Lugano is located in...</h3>",
			htmlId : "q-1",
			questionType : "multi-choice",
			formButtonType : "radio",
			questionOptions : [{
				correct : true,
				classList : "option",
				text : "Switzerland"
			}, {
				correct : false,
				classList : "option",
				text : "Italy"
			}, {
				correct : false,
				classList : "option",
				text : "France"
			}, {
				correct : true,
				classList : "option",
				text : "Germany"
			}]
		});
		questionID = newQuestion._id;

		newQuestion.save(function(err, question) {
			if (err) throw (err);
			console.log('Question saved')
			Question.findById(questionID, function(err, docs) {
				if (err) throw (err);
				done();
			})
		})

	});

	it("should create a new slideshow", function(done) {
		//Create sample Slideshow
		var newSlideshow = new Slideshow({
			title : "A sample slideshow for stats",
			studentFile : "nonExistingFile.none",
			teacherFile : "nonExistingFile.none",
			originalFile : "nonExistingFile.none",
			course : "A sample course",
			lastEdit : new Date(),
			lastSession : new Date(),
			questions : [questionID]
		});

		newSlideshow.save(function(err, slideshow) {
			if (err) throw (err);
			console.log('Slideshow saved')
			Slideshow.find({title : "A sample slideshow for stats"}, function(err, slideshow) {
				if (err) throw (err);
				done();
			})
		})
	});

	it("should create 15 new answers", function(done){
		//Create sample Answers
		for (var i = 0; i < 15; i++) {
			var newAnswer = new Answer({
				answeree : "Student" + i,
				question : questionID
			});

			if (i % 2 == 0) {
				newAnswer.submission = [true, false, false, false];
				newAnswer.correctness = 100;
			} else {
				newAnswer.submission = [false, true, false, true];
				newAnswer.correctness = 0;
			}
			newAnswer.save();
		}
		Answer.find({question: questionID}, function(err, answers){
			if (err) throw (err);
			done();
		})
	});

describe('Get stats for created answers', function() {
	it("should get right vs wrong data", function(done){
      request(app)
      .get('/stats/getStats?metric=rightVsWrong&question='+questionID)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });
    it("should get right vs wrong data", function(done){
      request(app)
      .get('/stats/getStats?metric=distinctOptions&question='+questionID)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });
    it("should get right vs wrong data", function(done){
      request(app)
      // console.log('/stats/getStats?metric=distinctAnswers&question='+questionID)
      .get('/stats/getStats')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });
});

});

