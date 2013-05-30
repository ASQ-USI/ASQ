var chai          = require('chai')
, chaiAsPromised  = require("chai-as-promised")
, expect          = chai.expect
, request         = require('supertest')
, express         = require('express')
, upload          = require('../routes/upload')
, schemas         = require('../models/models')
, mongoose        = require('mongoose')
, passport        = require('passport')
, passportMock    = require('./util/mock-passport-middleware')
, proxyquire      =  require('proxyquire')
, configStub      = {}
, path            = require('path')
, fsUtil          = require('../lib/fs-util')
, _               = require('underscore')
, assert 		  = require("assert")

// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);


// mongodb connection
db = mongoose.createConnection('127.0.0.1', 'test-asq');


// setup a small app for the upload test
var app = express();
app.configure(function() {
  app.use(express.bodyParser({uploadDir: './slides/'}));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'Ti kapsoura einai auth re miky'
  }));
  
  return app.use(passport.session());
});

	//Load required models
	var Question = db.model('Question', schemas.questionSchema);
	var Session = db.model('Session', schemas.sessionSchema);
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
	var Answer = db.model('Answer', schemas.answerSchema);
	
	
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


	//Create sample Slideshow
	var newSlideshow = new Slideshow({
		title : "A sample slideshow for stats",
		studentFile: "nonExistingFile.none",
		teacherFile: "nonExistingFile.none",
		originalFile: "nonExistingFile.none",
		course: "A sample course",
		lastEdit: new Date(),
		lastSession: new Date(),
		questions:[newQuestion._id]
	});
	
	
	//Create sample Answers
	
	for(var i = 0; i < 15; i++){
		var newAnswer = new Answer({
			answeree : "Student" + i,
			question: newQuestion._id
		});
		
		if(i % 2 == 0){
			newAnswer.submission  = [true,false,false,false];
			newAnswer.correctness = 100;
		}else{
			newAnswer.submission  = [false,true,false,true];
			newAnswer.correctness = 0;
		}

		newAnswer.save();
	}

	
	
	console.log(newAnswer._id);
	
	newQuestion.save();
	newSlideshow.save();
	console.log("Sample answers created");
newSlideshow.save();
