'use strict';

var ObjectId  = require('mongoose').Types.ObjectId;
var assert = require('assert');
var cheerio = require('cheerio');
var _ = require('lodash');
var hooks = require('../hooks/hooks.js');

var Parser = function(elementNames, questionElementNames){
  this.elementNames =  elementNames || [];
  this.questionElementNames = questionElementNames || [];
}


Parser.prototype.parsePresentation = function(options){
  options.html = this.assignIdsToAsqElements(options.html);
  options.elementNames = this.elementNames;
  options.questionElementNames = this.questionElementNames;

  return hooks.doHook('parse_html', options).then(function(options){
    return Promise.resolve(options);
  });
}

Parser.prototype.parsePresentationSettings = function(options){
  return hooks.doHook('parse_presentation_settings', options).then(function(options){
    return Promise.resolve(options);
  });
}


Parser.prototype.assignIdsToAsqElements = function(html){
  var $ = cheerio.load(html, {decodeEntities: false});

  this.elementNames.forEach(function(tagName){
    $(tagName).each(function(){
      if(! $(this).attr('uid')){
        $(this).attr('uid', ObjectId().toString());
      }
    });
  });

  return $.root().html();
};

Parser.prototype.asqify = function(html){

  var $ = cheerio.load(html, {decodeEntities: false});

  this.injectServerInfo($);
  this.injectScripts($);
  this.injectRoleInfo($);

  return $.root().html();
};

Parser.prototype.injectServerInfo = function($){
  assert.equal(1,  $('body').length, 
    "HTML document should contain a body element");

  var $body = $('body').eq(0);
  $body.attr('data-asq-role', '{role}');
  $body.attr('data-asq-host', '{host}');
  $body.attr('data-asq-port', '{port}');
  $body.attr('data-asq-session-id', '{id}');
  $body.attr('data-asq-live-url', '{presenterLiveUrl}');
  $body.attr('data-asq-presentation-viewer-url', '{presentationViewUrl}');
  $body.attr('data-asq-socket-namespace', '{namespace}');
  $body.attr('data-asq-socket-token', '{token}');
  $body.attr('data-asq-user-session-id', '{userSessionId}');
};

Parser.prototype.injectScripts = function($){
  assert.equal(1,  $('script[src$="impress.js"]').length, 
    "HTML document should contain impress.js");

  //include presenter or viewer scripts
  $('script[src$="impress.js"]').before('{>asqPresentationScripts /}');
  $('script[src$="impress.js"]').remove();
};

Parser.prototype.injectRoleInfo = function($){
  var eIds = this.getExercises($.root().html(), 'asq-exercise');
  var qIds = this.getQuestions($.root().html());

  eIds.forEach(function(eid, index){
    var selector = '[uid=' + eid + ']';
    $(selector).attr('role', '{role}');
  });

  qIds.forEach(function(qid, index){
    var selector = '[uid=' + qid + ']';
    $(selector).attr('role', '{role}');
  });
};

Parser.prototype.getExercises = function(html, exerciseTag){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    "Argument `html` should be a non empty string");
  assert(_.isString(exerciseTag) && (! _.isEmpty(exerciseTag)),
    "Argument `exerciseTag` should be a non empty string");

  var $ = cheerio.load(html, {decodeEntities: false});
  var eUids = [];


  $(exerciseTag).each(function(ex){
    assert.equal(false, _.isEmpty($(this).attr('uid')), 'Exercise elements should have a uid');
    eUids.push($(this).attr('uid')) 
  });

  return eUids;
};

Parser.prototype.getExercisesPerSlide = function(html, slideSelector, exerciseTag){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    "Argument `html` should be a non empty string");
  assert(_.isString(slideSelector) && (! _.isEmpty(slideSelector)),
    "Argument `slideSelector` should be a non empty string");
  assert(_.isString(exerciseTag) && (! _.isEmpty(exerciseTag)),
    "Argument `exerciseTag` should be a non empty string");

  var $ = cheerio.load(html, {decodeEntities: false});
  var results = Object.create(null);

  $(slideSelector).each(function(idx, el){
    var $el = $(el);
    assert.equal(false, _.isEmpty($el.attr('id')), 'Slide containers should have an id');

    var uids = $(this).find(exerciseTag).map(function(idx, el){
      var $el = $(el);
      assert.equal(false, _.isEmpty($el.attr('uid')), 'Exercise elements should have a uid');
      return $el.attr('uid');
    }).get();

    if(! _.isEmpty(uids)){
      results[$el.attr('id')] = uids;
    }
  });

  return results;
};

Parser.prototype.getQuestions = function(html){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    "Argument `html` should be a non empty string");

  var $ = cheerio.load(html, {decodeEntities: false});
  var qUids = [];

  this.questionElementNames.forEach(function(tagName){
    $(tagName).each(function(){
      assert.equal(false, _.isEmpty($(this).attr('uid')), 'Questions elements should have a uid');
      qUids.push($(this).attr('uid')) 
    });
  });

  return qUids;
};

Parser.prototype.getQuestionsPerSlide = function(html, slideSelector){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    "Argument `html` should be a non empty string");
  assert(_.isString(slideSelector) && (! _.isEmpty(slideSelector)),
    "Argument `slideSelector` should be a non empty string");

  var $ = cheerio.load(html, {decodeEntities: false});
  var results = Object.create(null);

  $(slideSelector).each(function(idx, slide){
    var $slide = $(slide);
    assert.equal(false, _.isEmpty($slide.attr('id')), 'Slide containers should have an id');

    var uids = [];

    this.questionElementNames.forEach(function(tagName){
      $slide.find(tagName).each(function(idx, el){
        assert.equal(false, _.isEmpty($(el).attr('uid')), 'Questions elements should have a uid');
        uids.push($(el).attr('uid')) 
      });
    });

    if(! _.isEmpty(uids)){
      results[$slide.attr('id')] = uids;
    }
  }.bind(this));

  return results;
};

module.exports = Parser;