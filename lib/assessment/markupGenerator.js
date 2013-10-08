/** @module lib/asqAssessmentMarkupGenerator
    @description Parse HTML files to extract assessment information
*/

/*
* node.js requires:    
* 'cheerio', ('../logger').appLogger, 'dustfs'
*
* browser requires:
* jQuery
*
*/

var when    = require('when')
  , _         = require("underscore")
  , isBrowser = require('../utils/shared').isBrowser()

  //to be set (if needed)
  , jQuery
  , cheerio
  , dust
  , logger
  , getOuterHTML ;

//private function to initialize environment
(function configureEnv_(html){
  //choose appropriate configuration
  isBrowser ? configure4Browser_() : configure4Node_()

})()

function configure4Node_(){
  cheerio = require('cheerio');
  logger  = require('../logger').appLogger;
  dust    = require('./dustfs')

  //loat dust templates
  var loading = dust.dirs('views/asq-render/');

  //the way dustfs works, adds listener per dust.render 
  //call to the monitored directories. Since we have a lot
  // of async renders we may have many listeners simultaneously
  // and trigger the maxlisteners error of node (for >10 listeners)
  // that's why we increase the listeners
  loading.setMaxListeners(1000);

  getRootHTML = function($) {
    return $.html()
  };
}

function configure4Browser_(){
  jQuery = require('jQuery');
  logger = console;
  dust   =  require('ASQTemplates')();

  getRootHTML = function($) {
    return $('body').html();
  };
}

var MarkupGenerator = module.exports = function(){
  this.defaultOptions={
    mode : "normal",
    userType: "",
    outputFormat : 'Array',    
    templates : {
      'multi-choice' : {
        'presenter' : 'questionList-presenter',
        'viewer' : 'questionList-viewer' 
      },
      'text-input' : {
       'presenter' : 'questionTextInput',
       'viewer' : 'questionTextInput'
      },
      'stats':  {
        'presenter' : 'stats',
        'viewer'  : 'answer',
      },      
      'welcome-screen' : {
        'presenter' : 'welcomeScreen-presenter',
        'viewer' : 'welcomeScreen-viewer' 
      }
    }
  };

  //placeholder for the dom manipulation library
  this.$ = null;
  this.options = {};
};

// default options for template names, selectors etc.

(function(){
  this.renderOne = function($el, question, userType){
    var deferred = when.defer();

    var template = this.defaultOptions.templates[question.questionType][userType]
    if(template === undefined){
      deferred.reject(new Error('Invalid template'));
    }

    dust.render(template, {question:question, userType:userType}, function(err, out) {
      if(err) {
        deferred.reject(err)
      }

     $el.attr('data-question-id', question.id);
     $el.find('ol').remove();
     $el.find('.stem').after(out)
    
      deferred.resolve(out);
    });

    return deferred.promise;
  }

  this.renderStat = function($stat, data, userType){
    var deferred = when.defer();
    dust.render(this.defaultOptions.templates.stats[userType], data, function(err, out) {
      if(err) {
        deferred.reject(err);
        return;
      }
      $stat.html(out);
      $stat.attr('data-target-assessment-id', data.question.id);
      deferred.resolve(out);
    });
    return deferred.promise;
  }

  this.renderWelcome = function($welcomeEl, data, userType){
    var deferred = when.defer();
    dust.render(this.defaultOptions.templates['welcome-screen'][userType], data, function(err, out) {
      if(err) {
        deferred.reject(err);
        return;
      }
      $welcomeEl.html(out);
      deferred.resolve(out);
    });
    return deferred.promise;
  }

  this.renderAll = function(questions, userType){
      var self = this
        , $ = this.$
        , deferreds = [];

      if(self.options.mode === "preview"){
         $('.asq-welcome-screen').each(function(){
           deferreds.push(self.renderWelcome($(this),
                          { presenterLiveUrl: "http://myserver:3000/myname/live" },
                          userType));
         })
      }else{
        //inject welcome-screen dust
      $('.asq-welcome-screen').html('{>"asq-render/'+ self.defaultOptions.templates['welcome-screen'][userType]+'.dust"/}')
      }
      

      var statId =0;
      // render questions
      _.each(questions, function(question){
        //render question
        deferreds.push(self.renderOne($('#' + question.htmlId), question, userType));

        //render stats or answers
        _.each($('.stats[data-target-assessment="' +question.htmlId+ '"]'), function(stat){
            deferreds.push(self.renderStat($(stat), {question:question, statId: ++statId}, userType));
        });
      })

      //inject dust vars for socket params in body data attrs
      $('body')
        .attr('data-asq-host', '{host}')
        .attr('data-asq-port', '{port}')
        .attr('data-asq-session-id', '{id}')
        .attr('data-asq-socket-mode', '{mode}');


      //if presenter render stat slides
      if(userType === "presenter"){

        //add presenter scripts       
        $('script[src$="impress.js"]')
          .attr('src', "/js/asq-presenter.js" )

      }else{ //we are not admin so render answer slides

          //add viewer scripts
        $('script[src$="impress.js"]')
          .attr('src', "/js/asq-viewer.js" )
      }
      
    return when.all(deferreds);

  }

  this.render = function(html, questions, options){
    var $ = this.$ = isBrowser ? jQuery : cheerio.load(html)
      , deferred = when.defer();

    if(typeof options !== "undefined"){
      _.extend(this.options, this.defaultOptions, options);
    }else{
      process.nextTick(function(){
        deferred.reject(new Error('You need to specify at least the userType in options'))
      });
    }

    var opts = this.options;

    if(typeof opts.userType ==' undefined' 
        || ['presenter','viewer'].indexOf(opts.userType)==-1) {
      process.nextTick(function(){
        deferred.reject(new Error('options.userType is missing, or invalid value'))
      });
    }

    this.renderAll(questions, opts.userType).then(function(){
      deferred.resolve(getRootHTML($));
    },
    function(err){
      deferred.reject(err);
    })

    return deferred.promise;
  }
}).call(MarkupGenerator.prototype);