'use strict';

var chai = require('chai')
var sinon = require('sinon');
var path = require('path')
var should = chai.should();
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var sinonAsPromised = require('sinon-as-promised')(Promise);
var modulePath = '../../../lib/parse/parse';
var parsed = require('./parseData');


describe('parse.js', function(){

  before(function(){
    var destination = this.destination = '/Users/vassilis/Sites/ASQ-USI/ASQ/test';
    this.originalFilePath = path.join(destination, 'presentation-id-123', 'samplePresentationRubrics.html'); 
    this.asqFilePath = path.join(destination, 'presentation-id-123', 'samplePresentationRubrics.asq.dust');

    var presentation = this.presentation = {
      '_id': 'presentation-id-123',
      'title': 'SamplePresentation',
      'owner': 'owner-id-123',
      'originalFile': 'samplePresentationRubrics.html',
      'asqFile': 'samplePresentationRubrics.asq.dust',
      'course': 'General',
      'path': this.destination + '/presentation-id-123',
      'asqFilePath': this.asqFilePath,
      'slidesTree': {
        "steps": ['step-1', 'step-2']
      },
      setQuestionsPerSlide: function(){},
      setStatsPerSlide: function(){},
      save: sinon.stub().resolves(this),
      markModified: sinon.stub()

    }

    // careful here this is promisified in parse.js. This means
    // that parse.js will have a call on `readFileAsync` instead of `readFile`
    // same writeFile
    this.fs = {
      readFile : function(){},
      writeFile : function(){}
    };

    sinon.stub(this.fs, 'readFile').callsArgWith(2, null, '<html></html>');
    sinon.stub(this.fs, 'writeFile').callsArgWith(2, null, '');

    //mock asqElementsParser
    var AsqElementsParser =this.AsqElementsParser = function AsqElementsParser(){};
    this.AsqElementsParser.prototype={
      parsePresentation: function(options){},
      parsePresentationSettings: function(options){},
      asqify: function(html){},
      getExercisesPerSlide: function(html, slideClass, tagName){},
      getExercises: function(html, tagName){},
      getQuestionsPerSlide: function(html, slideClass){},
      getQuestions: function(html){}
    }

    sinon.stub(this.AsqElementsParser.prototype, 'parsePresentation', function(options){
      return Promise.resolve(options);
    });
    sinon.stub(this.AsqElementsParser.prototype, 'parsePresentationSettings', function(options){
      return Promise.resolve(options);
    });
    sinon.stub(this.AsqElementsParser.prototype, 'asqify', function(html){
      return html;
    });
    sinon.stub(this.AsqElementsParser.prototype, 'getExercisesPerSlide', function(html, slideClass, tagName){
      return html;
    });
    sinon.stub(this.AsqElementsParser.prototype, 'getExercises', function(html, tagName){
      return html;
    });
    sinon.stub(this.AsqElementsParser.prototype, 'getQuestionsPerSlide', function(html, slideClass){
      return html;
    });
    sinon.stub(this.AsqElementsParser.prototype, 'getQuestions', function(html){
      return html;
    });


    // mock configuration
    // this.configuration = {
    //   createSlidesConfiguration: function(opts){},
    //   createExerciseConfiguration: function(opts){}
    // };
    // sinon.stub(this.configuration, 'createSlidesConfiguration', function(opts){
    //   return Promise.resolve(true);
    // });
    // sinon.stub(this.configuration, 'createExerciseConfiguration', function(opts){
    //   return Promise.resolve(opts.html);
    // });

    //mock db
    var ObjectId = require('mongoose').Types.ObjectId
    this.db = {model: function(){}};

    this.exerciseModel = { 
      'create' : function(e){},
      'find': function(c){}
    };
    this.questionModel = { 
      'create' : function(q){},
      'find': function(c){}
    };

    sinon.stub(this.exerciseModel, 'create', function(e){
      e.id = ObjectId().toString();
      return Promise.resolve(e);
    });

    sinon.stub(this.exerciseModel, 'find', function(c){
      return {
        exec: function(){
          return Promise.resolve([]);
        }
      }
    });

    sinon.stub(this.questionModel, 'create', function(q){
      q.id = ObjectId().toString();
      return Promise.resolve(q);
    });

    sinon.stub(this.questionModel, 'find', function(c){
      return {
        exec: function(){
          return Promise.resolve([]);
        }
      }
    });

    sinon.stub(this.db, 'model')
    .withArgs('Slideshow').returns({
      'findById' : function(){
        return {
          exec: function(){ return Promise.resolve(presentation);}
        }
      }
    })
    .withArgs('Exercise').returns(this.exerciseModel)
    .withArgs('Question').returns(this.questionModel)
    .withArgs('Rubric').returns({
      //emulate how mongoose create works
      'create' : function(r){ 
        var args = arguments
        return {
          then: function(cb){
            return cb.apply(null, args)}
        };
      }
    });

    this.getPluginNamesByTypeStub = sinon.stub()
    this.getPluginNamesByTypeStub.returns(Promise.resolve({
      element: ['el1', 'el2'],
      question: ['q1', 'q2']
    }));

    this.parse = SandboxedModule.require(modulePath, {
      requires: {
        'logger-asq': require('logger-asq'),
        'fs': this.fs,
        'lodash': require('lodash'),
        './AsqElementsParser' : this.AsqElementsParser,
        // '../configuration/conf.js' : this.configuration,
        'mongoose': require('mongoose'),
        '../plugin/' : {getPluginNamesByType: this.getPluginNamesByTypeStub}
      },
      globals : {
        db : this.db
      }
    });
  
  })

  describe('persistQuestionsForExercice', function(){

    beforeEach(function(){
      this.exerciseCopy = JSON.parse(JSON.stringify(parsed.exercises[0]));
    });

    it('should call function to create questions', function(done){
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

    it('should call function to create the exercise itself', function(done){
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

  describe('persistParsedData', function(){
    before(function(){
      sinon.spy(this.parse, 'persistQuestionsForExercice');
      sinon.spy(this.parse, 'getStatsWithQuestionIds');
      sinon.spy(this.parse, 'getRubricsWithQuestionIds');
    });
    beforeEach(function(){
      this.parsedDataCopy = JSON.parse(JSON.stringify(parsed));      
    });

    after(function(){
      this.parse.persistQuestionsForExercice.restore();
      this.parse.getStatsWithQuestionIds.restore();
      this.parse.getRubricsWithQuestionIds.restore();
    })

    it('should call function to persist questions for exercise', function(done){
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

    it('should call function to get stats with question ids', function(done){
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

    it('should call function to get rubrics with question ids', function(done){
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

    it('should should return an object with the parsed exercises and the persisted rubrics'
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

  describe('parseAndPersist', function(){

    before(function(){
      sinon.stub(this.parse, 'escapeDustBrackets', function(html){
        return html
      })
    })

    beforeEach(function(){
      this.AsqElementsParser.prototype.parsePresentation.reset();
      this.AsqElementsParser.prototype.parsePresentationSettings.reset();
      this.presentation.save.reset();
      this.presentation.markModified.reset();
      this.getPluginNamesByTypeStub.reset();
      this.exerciseModel.find.reset();
      this.questionModel.find.reset();
      this.fs.readFile.reset();
      this.fs.writeFile.reset();
      this.parse.escapeDustBrackets.reset();
    });

    after(function(){
      this.parse.escapeDustBrackets.restore();
    })

    it('should open the right file', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.fs.readFile.calledWith(this.asqFilePath, 'utf-8').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call plugin.getPluginNamesByType', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.getPluginNamesByTypeStub.calledOnce.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call parser.parsePresentationSettings', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        var expectedArg = {
          html: '<html></html>',
          slideshow_id: this.presentation._id
        }
        this.AsqElementsParser.prototype.parsePresentationSettings.calledWith(expectedArg).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
    
    it('should call parser.parsePresentation', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        var expectedArg = {
          html: '<html></html>',
          user_id: this.presentation.owner,
          slideshow_id: this.presentation._id
        }
        this.AsqElementsParser.prototype.parsePresentation.calledWith(expectedArg).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call escapeDustBrackets', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        var expectedArg = '<html></html>';
        this.parse.escapeDustBrackets.calledWith(expectedArg).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should write to file the results from the parsePresentation', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
        this.fs.writeFile.calledWith(this.asqFilePath, '<html></html>').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });
    
    it('should call parser.getExercisesPerSlide with the right arguments', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.AsqElementsParser.prototype.getExercisesPerSlide.calledWith('<html></html>', 'asq-exercise', ['step-1', 'step-2']).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should mark `exercisesPerSlide` as modified', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.presentation.markModified.firstCall.calledWith('exercisesPerSlide').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call parser.getExercises with the right arguments', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.AsqElementsParser.prototype.getExercises.calledWith('<html></html>', 'asq-exercise').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should check if the exercises exist in the DB', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.exerciseModel.find.calledOnce.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call parser.getQuestionsPerSlide with the right arguments', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.AsqElementsParser.prototype.getQuestionsPerSlide.calledWith('<html></html>', ['step-1','step-2']).should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should mark `questionsPerSlide` as modified', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.presentation.markModified.secondCall.calledWith('questionsPerSlide').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should call parser.getQuestions with the right arguments', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.AsqElementsParser.prototype.getQuestions.calledWith('<html></html>').should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

     it('should check if the questions exist in the DB', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.questionModel.find.calledOnce.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should add author information to the presentation questions', function(done){
      const question  = {
        save: sinon.stub()
      }
      this.questionModel.find.restore();
      sinon.stub(this.questionModel, 'find', function(c){
        return {
          exec: function(){
            return Promise.resolve([question]);
          }
        }
      });
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          question.author.should.equal(this.presentation.owner)
          question.save.calledOnce.should.equal(true);

       // restore question model to the previous stub
       this.questionModel.find.restore()
       sinon.stub(this.questionModel, 'find', function(c){
         return {
           exec: function(){
             return Promise.resolve([question]);
           }
         }
       });
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

    it('should save the presentation', function(done){
      this.parse.parseAndPersist(this.presentation._id)
      .then(function(){
          this.presentation.save.calledOnce.should.equal(true);
        done();
      }.bind(this))
      .catch(function(err){
        done(err);
      });
    });

  });
});
