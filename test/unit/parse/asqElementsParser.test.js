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
    this.slidesPerExerciseHtml = fs.readFileSync(require.resolve('./fixtures/slides-per-exercise.html'), 'utf-8');
    
    var then =  this.then = function(cb){
      return cb();
    };
    this.hooks = {doHook2: sinon.stub().returns({
      then: then
    })}
    this.AsqElementsParser = SandboxedModule.require(modulePath, {
      requires: {
        "lodash" : _,
        "../hooks/hooks.js" : this.hooks,
      }
    });
  });

   describe("prototype.parsePresentation", function(){

    before(function(){
      sinon.stub(this.AsqElementsParser.prototype, "assignIdsToAsqElements" )
      sinon.stub(this.AsqElementsParser.prototype, "getExercisesPerSlide" )
    });

    beforeEach(function(){
      this.hooks.doHook2.reset();
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

    it("should call assignIdsToAsqElements() ", function(){
      this.AsqElementsParser.prototype.getExercisesPerSlide.calledOnce.should.equal(true);
      this.AsqElementsParser.prototype.getExercisesPerSlide.calledWith(this.simpleHtml, sinon.match.any, sinon.match.any).should.equal(true);
    });

    it("should call doHook2() ", function(){
      this.hooks.doHook2.calledOnce.should.equal(true);
      this.hooks.doHook2.calledWith('parse_html', this.simpleHtml).should.equal(true);
    });

  });
  
  describe.skip("prototype.asqify()", function(){});
  describe.skip("prototype.injectServerInfo()", function(){});
  describe.skip("prototype.injectScripts()", function(){});

  describe("prototype.assignIdsToAsqElements()", function(){;

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.resultHtml = this.asqParser.assignIdsToAsqElements(this.simpleHtml)
      this.$ = cheerio.load(this.resultHtml);
    });

    it("should give uids to elements that are in the tagNames list", function(){
      var el = this.$("#ex-no-uid");
      expect(el.attr('uid')).to.exist();
      expect(el.attr('uid').length).to.be.greaterThan(5);

      el = this.$("#mc-no-uid");
      expect(el.attr('uid')).to.exist();
      expect(el.attr('uid').length).to.be.greaterThan(5);

    });

    it("should not give uids to elements that are not in the tagNames list", function(){
       var el = this.$("#uid");
      expect(el.attr('uid')).to.exist();
      expect(el.attr('uid')).to.equal('a-uid');
    });

    it("should not give uids to elements that already have a uid", function(){
      var $els = this.$("asq-stem");
      $els.each(function(idx, el){
        expect(this.$(el).attr('uid')).to.not.exist();
      }.bind(this));

      $els = this.$("asq-option");
      $els.each(function(idx, el){
        expect(this.$(el).attr('uid')).to.not.exist();
      }.bind(this))
    });
  });

  describe("prototype.getExercisesPerSlide()", function(){

    beforeEach(function(){
      this.asqParser = new this.AsqElementsParser(this.asq);
      this.$ = cheerio.load(this.slidesPerExerciseHtml);
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
  
});
