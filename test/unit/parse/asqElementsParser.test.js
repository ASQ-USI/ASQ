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
    this.simpleUidHtmlImpress = fs.readFileSync(require.resolve('./fixtures/simple-uid-impress.html'), 'utf-8');
    this.simpleUidHtmlReveal = fs.readFileSync(require.resolve('./fixtures/simple-uid-reveal.html'), 'utf-8');

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
        "cheerio" : require('cheerio'),
        "../hooks/hooks.js" : this.hooks,
      }
    });
  });

   describe('constructor', function(){

    it("correctly set elementNames", function(){

      this.parser =  new this.AsqElementsParser();
      var expected = ['asq-welcome', 'asq-text-input-q-stats']
      expect(this.parser.elementNames).to.deep.equal(expected);

      this.parser =  new this.AsqElementsParser([ 'asq-el-1', 'asq-el-2']);
      expected = [
        'asq-el-1',
        'asq-el-2',
        'asq-welcome',
        'asq-text-input-q-stats'
      ];
      expect(this.parser.elementNames).to.deep.equal(expected);

    })
    it("correctly set questionElementNames", function(){

       this.parser =  new this.AsqElementsParser();
       var expected = []
       expect(this.parser.questionElementNames).to.deep.equal(expected);

       this.parser =  new this.AsqElementsParser(null, [ 'asq-el-1', 'asq-el-2']);
       expected = [ 'asq-el-1', 'asq-el-2'];
       expect(this.parser.questionElementNames).to.deep.equal(expected);
     })
   })

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
      this.parser.parsePresentation({html: this.simpleHtml});
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
      var expected = {
        html: this.simpleHtml,
        elementNames: ['asq-welcome', 'asq-text-input-q-stats'],
        questionElementNames: []
      }
      this.hooks.doHook.calledWith('parse_html', expected).should.equal(true);
    });

  });

  describe("prototype.asqify()", function(){
    before(function(){
      sinon.stub(this.AsqElementsParser.prototype, "injectServerInfo");
      sinon.stub(this.AsqElementsParser.prototype, "injectScripts");
      sinon.stub(this.AsqElementsParser.prototype, "injectLiveApp");
      sinon.stub(this.AsqElementsParser.prototype, "injectRoleInfo");
    });

    beforeEach(function(){
      this.AsqElementsParser.prototype.injectServerInfo.reset();
      this.AsqElementsParser.prototype.injectScripts.reset();
      this.AsqElementsParser.prototype.injectLiveApp.reset();
      this.AsqElementsParser.prototype.injectRoleInfo.reset();
      this.parser =  new this.AsqElementsParser();
      this.parser.injectRoleInfo(this.simpleHtml);
    });

    after(function(){
      this.AsqElementsParser.prototype.injectServerInfo.restore();
      this.AsqElementsParser.prototype.injectScripts.restore();
      this.AsqElementsParser.prototype.injectLiveApp.restore();
      this.AsqElementsParser.prototype.injectRoleInfo.restore();
    });

    it("should call injectServerInfo() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });

    it("should call injectScripts() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });

    it("should call injectLiveApp() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });

    it("should call injectRoleInfo() ", function(){
      this.AsqElementsParser.prototype.injectRoleInfo.calledOnce.should.equal(true);
    });
  });
  describe("prototype.injectServerInfo()", function(){
    beforeEach(function(){
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleUidHtmlImpress);
      this.parser.injectServerInfo(this.$);
    });

    it("should have server info injected", function(){
      var $body = this.$('body').eq(0);
      expect($body.attr('data-asq-role')).to.equal('{role}');

      expect($body.attr('data-asq-host')).to.equal('{host}');
      expect($body.attr('data-asq-port')).to.equal('{port}');
      expect($body.attr('data-asq-session-id')).to.equal('{id}');
      expect($body.attr('data-asq-live-url')).to.equal('{presenterLiveUrl}');
      expect($body.attr('data-asq-presentation-viewer-url')).to.equal('{presentationViewUrl}');
      expect($body.attr('data-asq-socket-namespace')).to.equal('{namespace}');
      expect($body.attr('data-asq-user-session-id')).to.equal('{userSessionId}');
    });
  });

  describe("prototype.injectScripts()", function(){
    before(function(){
      sinon.stub(this.AsqElementsParser.prototype, "injectScriptsForImpress");
      sinon.stub(this.AsqElementsParser.prototype, "injectScriptsForReveal");
    });

    beforeEach(function(){
      this.AsqElementsParser.prototype.injectScriptsForImpress.reset();
      this.AsqElementsParser.prototype.injectScriptsForReveal.reset();
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleUidHtmlImpress);
    });

    after(function(){
      this.AsqElementsParser.prototype.injectScriptsForImpress.restore();
      this.AsqElementsParser.prototype.injectScriptsForReveal.restore();
    });


    it("should call injectScriptsForImpress() if `framework==\"impress.js\"`", function(){
      this.parser.injectScripts(this.$,"impress.js");
      this.AsqElementsParser.prototype.injectScriptsForImpress.calledOnce.should.equal(true);
    });

    it("should call injectScriptsForImpress() if `framework==\"impress.js\"`", function(){
      this.parser.injectScripts(this.$,"reveal.js");
      this.AsqElementsParser.prototype.injectScriptsForReveal.calledOnce.should.equal(true);
    });


    it("should throw an error if the framework is empty", function(){
      expect(this.parser.injectScripts.bind(this.parser, this.$))
        .to.throw(/missing or unknown framework/);
    });

    it("should throw an error if the framework is unknown", function(){
      expect(this.parser.injectScripts.bind(this.parser, this.$, "unknown.js"))
        .to.throw(/missing or unknown framework/);
    });
  });

  describe("prototype.injectScriptsForImpress()", function(){
    beforeEach(function(){
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleUidHtmlImpress);
      this.parser.injectScriptsForImpress(this.$);
    });


    it("should remove impress.js", function(){
      var x = this.$('script[src$="impress.js"]');
      expect(x.length).to.equal(0);
    });

    it("should inject the asq script placeholder", function(){
      var x = this.$.root().html().toString();
      expect(x.includes('{&gt;asqPresentationScripts /}')).to.be.true;
    });
  });

  describe("prototype.injectScriptsForReveal()", function(){
    beforeEach(function(){
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleUidHtmlReveal);
      this.parser.injectScriptsForReveal(this.$);
    });

    it("should inject the asq script placeholder", function(){
      var x = this.$.root().html().toString();
      expect(x.includes('{&gt;asqPresentationScripts /}')).to.be.true;
    });
  });

  describe("prototype.injectLiveApp()",function(){

    beforeEach(function(){
      this.parser =  new this.AsqElementsParser();
      this.$ = cheerio.load(this.simpleHtml);
      this.head = '<link rel="import" href="bower_components/asq-live-app/asq-live-app.html">';
      this.divImpress = '<div id="impress"></div>';
      this.divReveal = '<div id="reveal"></div>';
      this.liveApp = '<asq-live-app></asq-live-app>';
    });

    it("should inject the liveApp if `framework==\"impress.js\"`", function(){
      this.$('body').append(this.divImpress);
      this.parser.injectLiveApp(this.$,"impress.js");
      var x = this.$.root().html().toString();
      expect(x.includes(this.head)).to.be.true;
      expect(x.includes(this.liveApp)).to.be.true;
    });

    it("should inject the liveApp if `framework==\"reveal.js\"`", function(){
      this.$('body').append(this.divReveal);
      this.parser.injectLiveApp(this.$,"reveal.js");
      var x = this.$.root().html().toString();
      expect(x.includes(this.head)).to.be.true;
      expect(x.includes(this.liveApp)).to.be.true;
    });


    it("should throw an error if the framework is empty", function(){
      expect(this.parser.injectLiveApp.bind(this.parser, this.$))
        .to.throw(/missing or unknown framework/);
    });

    it("should throw an error if the framework is unknown", function(){
      expect(this.parser.injectLiveApp.bind(this.parser, this.$, "unknown.js"))
        .to.throw(/missing or unknown framework/);
    });
  });
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
      this.parser =  new this.AsqElementsParser(['asq-multi-choice-q'], ['asq-multi-choice-q']);
      this.$ = cheerio.load(this.simpleUidHtmlImpress);
      this.parser.injectRoleInfo(this.$);
    });

    after(function(){
      this.AsqElementsParser.prototype.getExercises.restore();
      this.AsqElementsParser.prototype.getQuestions.restore();
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
      this.asqParser = new this.AsqElementsParser(['asq-multi-choice-q'], ['asq-multi-choice-q']);
      this.resultHtml = this.asqParser.assignIdsToAsqElements(this.simpleHtml)
      this.$ = cheerio.load(this.resultHtml);
    });

    it("should give uids to elements that are in the tagNames list", function(){
      var el = this.$("#mc-no-uid");
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
      this.asqParser = new this.AsqElementsParser([], ['asq-multi-choice-q']);
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
      this.asqParser = new this.AsqElementsParser([], ['asq-multi-choice-q']);
      this.$ = cheerio.load(this.exercisesHtml);
    });

    it("should raise an error when invalid arguments are passed", function(){
      //null
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>'))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', 'sth'))
        .to.throw(/Argument `slidesIds` should be an Array/);

      //empty
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,''))
        .to.throw(/Argument `html` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', ''))
        .to.throw(/Argument `exerciseTag` should be a non empty string/);
      expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser,'<html>', 'sth',{}))
        .to.throw(/Argument `slidesIds` should be an Array/);
    });

    it("should not raise an error when the slides for the given ids exist", function(){
      var html = this.$.html('#one-ex-per-slide');
       expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser, html, 'asq-exercise', ['step-1', 'step-2']))
        .to.not.throw();
    });

    it("should raise an error when a slide for a given id doesn't exist", function(){
      var html = this.$.html('#one-ex-per-slide');
       expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser, html, 'asq-exercise', ['step-3']))
        .to.throw(/Slide with id step-3 should exist/);
    });

    it("should raise an error when exercise elements have no uid", function(){
      var html = this.$.html('#no-exercise-uids');
       expect(this.asqParser.getExercisesPerSlide.bind(this.asqParser, html, 'asq-exercise', ['step-1', 'step-2']))
        .to.throw(/Exercise elements should have a uid/);
    });

    it("should report the exercises per slides correctly", function(){
      var html = this.$.html('#one-ex-per-slide');
      var results = this.asqParser.getExercisesPerSlide( html, 'asq-exercise', ['step-1', 'step-2']);
      expect(results["step-1"]).to.exist;
      expect(results["step-1"]).to.deep.equal(['uid-1'])
      expect(results["step-2"]).to.exist;
      expect(results["step-2"]).to.deep.equal(['uid-2'])
    });

    it("should report the exercises per slides correctly for multiple exercises per slide", function(){
      var html = this.$.html('#more-than-one-ex-per-slide');
      var results = this.asqParser.getExercisesPerSlide( html, 'asq-exercise', ['step-1', 'step-2']);
      expect(results["step-1"]).to.exist;
      expect(results["step-1"]).to.deep.equal(['uid-1', 'uid-2', 'uid-3']);
      expect(results["step-2"]).to.exist;
      expect(results["step-2"]).to.deep.equal(['uid-4', 'uid-5']);
    });
  });

  describe("prototype.getQuestions()", function(){
    beforeEach(function(){
      var knownQuestionTypes = [
        'asq-multi-choice-q',
        'asq-text-input-q',
        'asq-code-q',
        'asq-rating-q',
        'asq-highlight-q',
        'asq-css-select-q',
        'asq-js-function-body-q'
      ];
      this.asqParser = new this.AsqElementsParser(knownQuestionTypes, knownQuestionTypes);
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
        'uid-multi-choice-q',
        'uid-text-input-q',
        'uid-code-q',
        'uid-rating-q',
        'uid-highlight-q',
        'uid-css-select-q',
        'uid-js-function-body-q'
      ]);
    });

    it("should neglect unkown question types", function(){
      var html = this.$.html('#unknown-question-types');
      var results = this.asqParser.getQuestions(html);
      expect(results).to.deep.equal([
        'uid-text-input-q',
        'uid-code-q',
        'uid-rating-q'
      ]);
    });
  });

});
