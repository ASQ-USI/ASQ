/**
  @fileoverview tests for model/question.js for ASQ
**/
var chai   = require('chai')
, assert   = chai.assert
, expect   = chai.expect
, mongoose = require('mongoose')
, config   = require('../config');

db = mongoose.createConnection(
  config.mongoDBServer,
  config.dbName,
  config.mongoDBPort
);

require('../models'); //Load db models.

var questionModel = require("../models/question");

// support for promises
// require("mocha-as-promised")();
// chai.use(chaiAsPromised);

var Question = db.model("Question");


describe('Question model', function() {

  before(function(done){
    Question.remove({},  function(err){
      if (err) throw err;
      done();
    });
  });

  after(function(done){
    Question.remove({},  function(err){
      if (err) throw err;
      done();
    });
  })

  it("should create a new question", function(done){
    var q = new Question({
      htmlId: "q-1",
      stem: "How's the weather today?",
      formButtonType: "checkbox",
      questionOptions:[
        {text : "Cloudy", correct : true},
        {text : "Sunny",  correct : true},
        {text : "Rainy",  correct : true},
        {text : "Stormy", correct : true}
      ]
    });

    q.save(function (err, question) {
      if (err) throw(err);
      console.log('saved')

      Question.find({htmlId : "q-1"}, function(err, docs){
        if(err) throw(err);

        done();
      })
    })

  })

  //  describe('.getFirstHtmlFile(path)', function(){
  //   it.skip('should be tested')
  // });

});
