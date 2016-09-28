'use strict';

var ObjectId  = require('mongoose').Types.ObjectId;
var assert = require('assert');
var cheerio = require('cheerio');
var _ = require('lodash');
var hooks = require('../hooks/hooks.js');

function loadCheerioDoc(html){
  return cheerio.load(html,  {
    decodeEntities: false,
    lowerCaseAttributeNames:false,
    lowerCaseTags:false,
    recognizeSelfClosing: true
  });
}

var Parser = function(elementNames, questionElementNames){
  this.elementNames =  elementNames || [];

  // fixme: it's not nice to hardcode elements
  this.elementNames.push('asq-welcome');
  this.elementNames.push('asq-text-input-q-stats');

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
  var $ = cheerio.load(html, {
  decodeEntities: false,
  lowerCaseAttributeNames:false,
  lowerCaseTags:false,
  recognizeSelfClosing: true
});

  this.elementNames.forEach(function(tagName){
    $(tagName).each(function(){
      if(! $(this).attr('uid')){
        $(this).attr('uid', ObjectId().toString());
      }
    });
  });

  return $.root().html();
};

Parser.prototype.asqify = function(html, presentationFramework){

  var $ = loadCheerioDoc(html);

  this.injectServerInfo($);
  this.injectScripts($, presentationFramework);
  this.injectRoleInfo($);

  return $.root().html();
};

Parser.prototype.injectServerInfo = function($){
  assert.equal(1,  $('body').length, 
    'HTML document should contain a body element');

  var $body = $('body').eq(0);
  $body.addClass('asq');
  $body.attr('data-asq-role', '{role}');
  $body.attr('data-asq-host', '{host}');
  $body.attr('data-asq-port', '{port}');
  $body.attr('data-presentation-framework', '{presentationFramework}');
  $body.attr('data-asq-session-id', '{id}');
  $body.attr('data-asq-live-url', '{presenterLiveUrl}');
  $body.attr('data-asq-presentation-viewer-url', '{presentationViewUrl}');
  $body.attr('data-asq-socket-namespace', '{namespace}');
  $body.attr('data-asq-user-session-id', '{userSessionId}');
};

Parser.prototype.injectScripts = function($, framework){
  if(framework == 'impress.js'){
    this.injectScriptsForImpress($);
  }else if(framework == 'reveal.js'){
    this.injectScriptsForReveal($);
  }else{
    throw new Error('missing or unknown framework');
  }
};

Parser.prototype.injectScriptsForReveal = function($){
  assert.equal(1,  $('script[src$="reveal.js"]').length, 
    'HTML document should contain reveal.js');

  //include presenter or viewer scripts
  $('script[src$="reveal.js"]').before('{>asqPresentationScripts /}');
};

Parser.prototype.injectScriptsForImpress = function($){
  assert.equal(1,  $('script[src$="impress.js"]').length, 
    'HTML document should contain impress.js');

  //include presenter or viewer scripts
  $('script[src$="impress.js"]').before('{>asqPresentationScripts /}');
  $('script[src$="impress.js"]').remove();
};

Parser.prototype.injectRoleInfo = function($){

  var allAsqEls = _.union(['asq-exercise'], 
    this.elementNames, this.questionElementNames);

  allAsqEls.forEach(function(tagName){
    $(tagName).each(function(){
      $(this).attr('role', '{role}');
    });
  });
};

Parser.prototype.getExercises = function(html, exerciseTag){
  assert(_.isString(html) && (! _.isEmpty(html)), 
    'Argument `html` should be a non empty string');
  assert(_.isString(exerciseTag) && (! _.isEmpty(exerciseTag)),
    'Argument `exerciseTag` should be a non empty string');

  var $ = loadCheerioDoc(html);
  var eUids = [];

  $(exerciseTag).each(function(ex){
    assert.equal(false, _.isEmpty($(this).attr('uid')), 'Exercise elements should have a uid');
    eUids.push($(this).attr('uid')) 
  });

  return eUids;
};

Parser.prototype.getExercisesPerSlide = function(html, exerciseTag, slidesIds){
  assert(_.isString(html) && (! _.isEmpty(html)), 
    'Argument `html` should be a non empty string');
  
  assert(_.isString(exerciseTag) && (! _.isEmpty(exerciseTag)),
    'Argument `exerciseTag` should be a non empty string');

  assert(_.isArray(slidesIds),
    'Argument `slidesIds` should be an Array');
  
  var $ = loadCheerioDoc(html);

  var results = Object.create(null);

  slidesIds.forEach(function(id, idx){
    var $slide = $('#' + id);
    assert(!_.isEmpty($slide),
      'Slide with id ' + id + ' should exist')

    var uids = $slide.find(exerciseTag).map(function(idx, el){
      var $el = $(el);
      assert.equal(false, _.isEmpty($el.attr('uid')), 'Exercise elements should have a uid');
      return $el.attr('uid');
    }).get();

    if(! _.isEmpty(uids)){
      results[id] = uids;
    }
  });


  return results;
};

Parser.prototype.getQuestions = function(html){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    'Argument `html` should be a non empty string');

  var $ = loadCheerioDoc(html);
  var qUids = [];

  this.questionElementNames.forEach(function(tagName){
    $(tagName).each(function(){
      assert.equal(false, _.isEmpty($(this).attr('uid')), 'Questions elements should have a uid');
      qUids.push($(this).attr('uid')) 
    });
  });

  return qUids;
};

Parser.prototype.getQuestionsPerSlide = function(html, slidesIds){

  assert(_.isString(html) && (! _.isEmpty(html)), 
    'Argument `html` should be a non empty string');

  var $ = loadCheerioDoc(html);
  var results = Object.create(null);

  slidesIds.forEach(function(id, idx){
    var $slide = $('#' + id);
    assert.equal(false, _.isEmpty($slide.attr('id')), 'Slide containers should have an id');

    var uids = [];

    this.questionElementNames.forEach(function(tagName){
      $slide.find(tagName).each(function(idx, el){
        assert.equal(false, _.isEmpty($(el).attr('uid')), 'Questions elements should have a uid');
        uids.push($(el).attr('uid')) 
      });
    });

    if(! _.isEmpty(uids)){
      results[id] = uids;
    }
  }, this);
  

  return results;
};

module.exports = Parser;