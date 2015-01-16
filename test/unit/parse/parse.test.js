"use strict";

var chai = require('chai')
var sinon = require("sinon");
var should = chai.should();
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var modulePath = "../../../lib/parse/parse";
var parsed = require('./parseData');


describe("parse.js", function(){

  before(function(){

    var presentation = this.presentation = {
      "_id": "presentation-id-123",
      "title": "SamplePresentation",
      "owner": "owner-id-123",
      "originalFile": "samplePresentationRubrics.html",
      "course": "General",
      setQuestionsPerSlide: function(){},
      setStatsPerSlide: function(){},
      saveWithPromise: function(){ return Promise.resolve(this);}
    }

    // careful here this is promisified in parse.js. This means
    // that parse.js will have a call on `readFileAsync` instead of `readFile`
    // same writeFile
    this.fs = {
      readFile : function(){},
      writeFile : function(){}
    };

    sinon.stub(this.fs, "readFile").callsArgWith(2, null, "<html></html>");
    sinon.stub(this.fs, "writeFile").callsArgWith(2, null, "");

    // mock asq-microformat parser
    this.parserStubFn = function(){
      //deep copy of parsed data
      return JSON.parse(JSON.stringify(parsed));
    }
    this.asqMParser = function(){};
    this.asqMParser.prototype.parse = function(){};
    sinon.stub(this.asqMParser.prototype, "parse", this.parserStubFn);

    //mock asq-microformat markupGenerator
    this.renderStubFn = function(){
      //deep copy of parsed data
      return Promise.resolve("<html>generated</html>");
    }
    this.markupGenerator = function(){};
    this.markupGenerator.prototype.render = function(){};
    sinon.stub(this.markupGenerator.prototype, "render", this.renderStubFn);

    //mock db
    var ObjectId = require('mongoose').Types.ObjectId
    this.db = {model: function(){}};

    this.exerciseModel = { "create" : function(e){}};
    this.questionModel = { "create" : function(q){}};

    sinon.stub(this.exerciseModel, "create", function(e){
      e.id = ObjectId().toString();
      return Promise.resolve(e);
    });

    sinon.stub(this.questionModel, "create", function(q){
      q.id = ObjectId().toString();
      return Promise.resolve(q);
    });

    sinon.stub(this.db, "model")
    .withArgs("Slideshow").returns({
      "findById" : function(){
        return {
          exec: function(){ return Promise.resolve(presentation);}
        }
      }
    })
    .withArgs("Exercise").returns(this.exerciseModel)
    .withArgs("Question").returns(this.questionModel)
    .withArgs("Rubric").returns({
      //emulate how mongoose create works
      "create" : function(r){ 
        return {
          then: function(cb){
            var res = r;
            if(!(r instanceof Array)){
              res = [r];
            }
            return cb.apply(null, res)}
        };
      }
    });

    var destination = this.destination = "/Users/vassilis/Sites/ASQ-USI/ASQ/test";
    this.parse = SandboxedModule.require(modulePath, {
      requires: {
        'fs': this.fs,
        'asq-microformat' : {
          parser: this.asqMParser,
          generator: this.markupGenerator
        },
        '../logger' : {appLogger: {
          log: function(){},
          debug: function(){}
        }}
      },
      globals : {
        app :{
          get: function(){
            return destination;
          }
        },
        db : this.db
      }
    });
    this.mainFilePath = destination + '/' + this.presentation._id + '/' + this.presentation.originalFile; 
  })

  describe("persistQuestionsForExercice", function(){

    beforeEach(function(){
      this.exerciseCopy = JSON.parse(JSON.stringify(parsed.exercises[0]));
    });

    it("should call function to create questions", function(done){
      this.parse.persistQuestionsForExercice({}, this.exerciseCopy)
      .then(function(){
        var l = this.exerciseCopy.questions.length;
        this.questionModel.create.callCount.should.equal(l);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should call function to create the exercise itself", function(done){
      this.exerciseModel.create.reset();
      this.parse.persistQuestionsForExercice({}, this.exerciseCopy)
      .then(function(){
        this.exerciseModel.create.callCount.should.equal(1);
        done();
      }.bind(this),
      function(err){
        done(err);
      });
    });

  });

  describe("persistParsedData", function(){
    before(function(){
      sinon.spy(this.parse, "persistQuestionsForExercice");
      sinon.spy(this.parse, "getStatsWithQuestionIds");
      sinon.spy(this.parse, "getRubricsWithQuestionIds");
    });
    beforeEach(function(){
      this.parsedDataCopy = JSON.parse(JSON.stringify(parsed));      
    });

    after(function(){
      this.parse.persistQuestionsForExercice.restore();
      this.parse.getStatsWithQuestionIds.restore();
      this.parse.getRubricsWithQuestionIds.restore();
    })

    it("should call function to persist questions for exercise", function(done){
      this.parse.persistParsedData(this.presentation._id, this.parsedDataCopy)
      .then(function(){
        var l = this.parsedDataCopy.exercises.length;
        this.parse.persistQuestionsForExercice.callCount.should.equal(l);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should call function to get stats with question ids", function(done){
      this.parse.getStatsWithQuestionIds.reset();
      this.parse.persistParsedData(this.presentation._id, this.parsedDataCopy)
      .then(function(){
        this.parse.getStatsWithQuestionIds.callCount.should.equal(1);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should call function to get rubrics with question ids", function(done){
      this.parse.getRubricsWithQuestionIds.reset();
      this.parse.persistParsedData(this.presentation._id, this.parsedDataCopy)
      .then(function(){
        this.parse.getRubricsWithQuestionIds.callCount.should.equal(1);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should should return an object with the parsed exercises and the persisted rubrics"
      , function(done){
      this.parse.getRubricsWithQuestionIds.reset();
      this.parse.persistParsedData(this.presentation._id, this.parsedDataCopy)
      .then(function(res){
        should.exist(res);
        should.exist(res.exercises);
        should.exist(res.rubrics);
        res.exercises[0].questions[0].htmlId.should.equal(this.parsedDataCopy.exercises[0].questions[0].htmlId);
        should.exist(res.exercises[0].questions[0].id);
        res.rubrics.should.deep.equal(this.parsedDataCopy.rubrics);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
  });

  describe("parseAndPersist", function(){
    before(function(){
      sinon.stub(this.parse, "generateMainFileForRoles").returns(Promise.resolve(true));
    });

    beforeEach(function(){
      this.fs.writeFile.reset();
      this.parse.generateMainFileForRoles.reset();
    });

    after(function(){
      this.parse.generateMainFileForRoles.restore();
    });

    it("should open the right file", function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.fs.readFile.calledWith(this.mainFilePath, 'utf-8').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
    
    it("should call the parser", function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.asqMParser.prototype.parse.calledWith("<html></html>").should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
    
    it("when there is a parser error it should throw an error", function(done){
      this.asqMParser.prototype.parse.restore();
      sinon.stub(this.asqMParser.prototype, "parse", function(){
        //deep copy of parsed data
        return {errors: [new Error('parser error')]}
      });
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        done(new Error("it shouldn't call the resolve callback"));
      },
      function(err){
          should.exist(err);
          err.message.should.contain('Parsing failed');
          done();
      });
    });
    
    it("should not write the presentation file when there's no html output from the parser", function(done){
      this.asqMParser.prototype.parse.restore();
      sinon.stub(this.asqMParser.prototype, "parse", this.parserStubFn);
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.fs.writeFile.called.should.equal(false);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should write the presentation file when there's html output from the parser", function(done){
      this.asqMParser.prototype.parse.restore();
      sinon.stub(this.asqMParser.prototype, "parse", function parserWithHtmlStubFn(){
        //deep copy of parsed data
        var data = JSON.parse(JSON.stringify(parsed));
        data.html = "<html>corrected html</html>";
        return data;
      });
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.fs.writeFile.called.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should call persistParsedData", function(done){
      sinon.spy(this.parse, "persistParsedData");
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.parse.persistParsedData.called.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should generate the main file for the different roles", function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.parse.generateMainFileForRoles.called.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
  });

  describe("generateMainFileForRoles", function(){
    before(function(){
      sinon.spy(this.parse, "generateMainFileForRole");
    })
    beforeEach(function(){
      this.parsedDataCopy = JSON.parse(JSON.stringify(parsed));
      this.parse.generateMainFileForRole.reset();   
      this.fs.readFile.reset();   
    });

    it("should read the presentations main file", function(done){
      this.parse.generateMainFileForRoles(this.presentation._id, this.parsedDataCopy.exercises, this.parsedDataCopy.rubrics)
      .then(function(){
        this.fs.readFile.calledOnce.should.equal(true);
        this.fs.readFile.calledWith(this.mainFilePath).should.equal(true)
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it("should call generateMainFileForRole for all the roles", function(done){
      this.parse.generateMainFileForRoles(this.presentation._id, this.parsedDataCopy.exercises, this.parsedDataCopy.rubrics)
      .then(function(){
        this.parse.generateMainFileForRole.calledTwice.should.equal(true);
        this.parse.generateMainFileForRole
          .calledWith(sinon.match.any, sinon.match.any, 'viewer').should.equal(true); 
        this.parse.generateMainFileForRole
          .calledWith(sinon.match.any, sinon.match.any, 'presenter').should.equal(true); 
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
  });
});
