"use strict";

var chai = require('chai');
var sinon = require("sinon");
var should = chai.should();
var expect = chai.expect;
var SandboxedModule = require('sandboxed-module');
var Promise = require('bluebird');
var cheerio = require('cheerio')
var fs = require('fs');
var _ = require('lodash');
var modulePath = "../../../lib/parse/AsqElementsParser";

describe("asqElementsParser.js", function(){
 before(function(){
    this.simpleHtml = fs.readFileSync(require.resolve('./fixtures/simple.html'), 'utf-8');
    this.exercisesHtml = fs.readFileSync(require.resolve('./fixtures/exercises.html'), 'utf-8');
    this.questionsHtml = fs.readFileSync(require.resolve('./fixtures/questions.html'), 'utf-8');
    this.simpleUidHtml = fs.readFileSync(require.resolve('./fixtures/simple-uid.html'), 'utf-8');
    
    var then =  this.then = function(cb){
      return cb();
    };
    this.hooks = {doHook: sinon.stub().returns({
      then: then
    })}
    this.AsqElementsParser = SandboxedModule.require(modulePath, {
      requires: {
        "mongoose" : require('mongoose'),
        "lodash" : _,
        "../hooks/hooks.js" : this.hooks,
      }
    });
  });

   describe("prototype.parsePresentation", function(){

    before(function(){
      sinon.stub(this.AsqElementsParser.prototype, "assignIdsToAsqElements" );
      sinon.stub(this.AsqElementsParser.prototype, "getExercisesPerSlide" );
      this.AsqElementsParser.prototype.assignIdsToAsqElements.returns( this.simpleHtml);
    });

    beforeEach(function(){
      this.hooks.doHook.reset();
      this.AsqElementsParser.prototype.assignIdsToAsqElements.reset();
      this.AsqElementsParser.prototype.getExercisesPerSlide.reset();
      this.parser =  new this.AsqElementsParser();
      this.parser.parsePresentation(this.simpleHtml);
    });

    after(function(){
      this.AsqElementsParser.prototype.assignIdsToAsqElements.restore();
      this.AsqElementsParser.prototype.getExercisesPerSlide.restore();
    });

    it("should call assignIdsToAsqElements() ", function(){
      this.AsqElementsParser.prototype.assignIdsToAsqElements.calledOnce.should.equal(true);
      this.AsqElementsParser.prototype.assignIdsToAsqElements.calledWith(this.simpleHtml).should.equal(true);
    });

    it("should call doHook() ", function(){
      this.hooks.doHook.calledOnce.should.equal(true);
      this.hooks.doHook.calledWith('parse_html', this.simpleHtml).should.equal(true);
    });

  });
  
  describe("prototype.asqify()", function(){
    before(function(){
      sinon.stub(this.AsqElementsParser.prototype, "injectServerInfo");
      sinon.stub(this.AsqElementsParser.prototype, "injectScripts");
      sinon.stub(this.AsqElementsParser.prototype, "injectRoleInfo");
    });

    beforeEach(function(){
      this.AsqElementsParser.prototype.injectServerInfo.reset();
      this.AsqElementsParser.prototype.injectScripts.reset();
      this.AsqElementsParser.prototype.injectRoleInfo.reset();
      this.parser =  new this.AsqElementsParser();
      this.parser.injectRoleInfo(this.simpleHtml);
    });

    after(function(){
      this.AsqElementsParser.prototype.injectServerInfo.restore();
      this.AsqElementsParser.prototype.injectScripts.restore();
      this.AsqElementsParser.prototype.injectRoleInfo.restore();
    });

    it("should call injectServerInfo() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });

    it("should call injectScripts() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });

    it("should call injectRoleInfo() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });
  });
  describe.skip("prototype.injectServerInfo()", function(){});
  describe.skip("prototype.injectScripts()", function(){});

  describe("prototype.injectRoleInfo()", function(){
    before(function(){
      this.eids = ['uid1','uid4'];
      this.qids = ['uid2', 'uid3', 'uid5'];
      sinon.stub(this.AsqElementsParser.prototype, "getExercises");
      this.AsqElementsParser.prototype.getExercises.returns(['uid1','uid4']);

      sinon.stub(this.AsqElementsParser.prototype, "getQuestions");
      this.AsqElementsParser.prototype.getQuestions.returns(['uid2', 'uid3', 'uid5']);
    });

    beforeEach(function(){
      this.AsqElementsParser.prototype.getExercises.reset();
      this.AsqElementsParser.prototype.getQuestions.reset();
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleUidHtml);
      this.parser.injectRoleInfo(this.$);
    });

    after(function(){
      this.AsqElementsParser.prototype.getExercises.restore();
      this.AsqElementsParser.prototype.getQuestions.restore();
    });

    it("should call getExercises() ", function(){
      this.AsqElementsParser.prototype.getExercises.calledOnce.should.equal(true);
      this.AsqElementsParser.prototype.getExercises.calledWith(this.simpleUidHtml).should.equal(true);
    });

    it("should call getQuestions() ", function(){
      this.AsqElementsParser.prototype.getQuestions.calledOnce.should.equal(true);
      this.AsqElementsParser.prototype.getQuestions.calledWith(this.simpleUidHtml).should.equal(true);
    });

    it("should have roleinfo injected for exercises", function(){
      this.eids.forEach(function(eid, index){
        var selector = '[uid=' + eid + ']';
        var ex = this.$(selector);
        expect(ex).to.exist;
        expect(ex.attr('role')).to.equal('{role}');
      }, this);
    });

    it("should have roleinfo injected for questions", function(){
      this.qids.forEach(function(qid, index){
        var selector = '[uid=' + qid + ']';
        var question = this.$(selector);
        expect(question).to.exist;
        expect(question.attr('role')).to.equal('{role}');
      }, this);
    });


  });

  describe("prototype.assignIdsToAsqElements()", function(){;

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.resultHtml = this.asqParser.assignIdsToAsqElements(this.simpleHtml)
      this.$ = cheerio.load(this.resultHtml);
    });

    it("should give uids to elements that are in the tagNames list", function(){
      var el = this.$("#ex-no-uid");
      expect(el.attr('uid')).to.exist;
      expect(el.attr('uid').length).to.be.greaterThan(5);

      el = this.$("#mc-no-uid");
      expect(el.attr('uid')).to.exist;
      expect(el.attr('uid').length).to.be.greaterThan(5);

    });

    it("should not give uids to elements that are not in the tagNames list", function(){
       var el = this.$("#uid");
      expect(el.attr('uid')).to.exist;
      expect(el.attr('uid')).to.equal('a-uid');
    });

    it("should not give uids to elements that already have a uid", function(){
      var $els = this.$("asq-stem");
      $els.each(function(idx, el){
        expect(this.$(el).attr('uid')).to.not.exist;
      }.bind(this));

      $els = this.$("asq-option");
      $els.each(function(idx, el){
        expect(this.$(el).attr('uid')).to.not.exist;
      }.bind(this))
    });
  });

  describe("prototype.getExercises()", function(){

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.$ = cheerio.load(this.exercisesHtml);
    });

    it("should raise an error when invalid arguments are passed", function(){
      //null
      expect(this.asqParser.getExercises.bind(this.asqParser))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercises.bind(this.asqParser,'<html>'))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);

      //empty
      expect(this.asqParser.getExercises.bind(this.asqParser,''))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercises.bind(this.asqParser,'<html>',''))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);
    });

    it("should raise an error when exercise elements have no uid", function(){
      var html = this.$.html('#no-exercise-uids');
       expect(this.asqParser.getExercises.bind(this.asqParser, html, 'asq-exercise'))
        .to.throw(/Exercise elements should have a uid/);
    });

    it("should report the exercises per slides correctly", function(){
      var html = this.$.html('#more-than-one-ex-per-slide');
      var results = this.asqParser.getExercises( html, 'asq-exercise');
      expect(results).to.exist;
      expect(results).to.deep.equal(['uid-1', 'uid-2', 'uid-3', 'uid-4', 'uid-5']);
    });
  });

  describe("prototype.getExercisesPerSlide()", function(){

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.$ = cheerio.load(this.exercisesHtml);
    });

    it("should raise an error when invalid arguments are passed", function(){
      //null
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>'))
        .to.throw(/Argument `slideSelector` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', 'sth'))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);

      //empty
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,''))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', ''))
        .to.throw(/Argument `slideSelector` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', 'sth',''))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);
    });

    it("should raise an error when slide containers have no id", function(){
      var html = this.$.html('#no-step-ids');
       expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,html, '.step', 'asq-exercise'))
        .to.throw(/Slide containers should have an id/);
    });

    it("should raise an error when exercise elements have no uid", function(){
      var html = this.$.html('#no-exercise-uids');
       expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,html, '.step', 'asq-exercise'))
        .to.throw(/Exercise elements should have a uid/);
    });

    it("should report the exercises per slides correctly", function(){
      var html = this.$.html('#one-ex-per-slide');
      var results = this.asqParser.getExercisesPerSlide( html, '.step', 'asq-exercise');
      expect(results["step-1"]).to.exist;
      expect(results["step-1"]).to.deep.equal(['uid-1'])
      expect(results["step-2"]).to.exist;
      expect(results["step-2"]).to.deep.equal(['uid-2'])
    });

    it("should report the exercises per slides correctly for multiple exercises per slide", function(){
      var html = this.$.html('#more-than-one-ex-per-slide');
      var results = this.asqParser.getExercisesPerSlide( html, '.step', 'asq-exercise');
      expect(results["step-1"]).to.exist;
      expect(results["step-1"]).to.deep.equal(['uid-1', 'uid-2', 'uid-3']);
      expect(results["step-2"]).to.exist;
      expect(results["step-2"]).to.deep.equal(['uid-4', 'uid-5']);
    });
  });

  describe("prototype.getQuestions()", function(){

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.$ = cheerio.load(this.questionsHtml);
    });

    it("should raise an error when invalid arguments are passed", function(){
      //null
      expect(this.asqParser.getQuestions.bind(this.asqParser))
        .to.throw(/Argument `html` should be a non empty string/);

      //empty
      expect(this.asqParser.getQuestions.bind(this.asqParser,''))
        .to.throw(/Argument `html` should be a non empty string/);
    });

    it("should raise an error when question elements have no uid", function(){
      var html = this.$.html('#no-question-uids');
       expect(this.asqParser.getQuestions.bind(this.asqParser, html))
        .to.throw(/Questions elements should have a uid/);
    });

    it("should return valid results", function(){
      var html = this.$.html('#question-uids');
      var results = this.asqParser.getQuestions(html);
      expect(results).to.deep.equal(['uid-1', 'uid-2'])
    });

    it("should work for all known question types", function(){
      var html = this.$.html('#many-question-types');
      var results = this.asqParser.getQuestions(html);
      expect(results).to.deep.equal([
        'uid-multi-choice',
        'uid-text-input',
        'uid-code',
        'uid-rating',
        'uid-highlight',
        'uid-css-select',
        'uid-js-function-body'
      ]);
    });

    it("should neglect unkown question types", function(){
      var html = this.$.html('#unknown-question-types');
      var results = this.asqParser.getQuestions(html);
      expect(results).to.deep.equal([
        'uid-text-input',
        'uid-code',
        'uid-rating'
      ]);
    });
  });
  
});
