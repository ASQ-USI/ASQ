/** @module lib/assessment/parser
    @description Parse HTML files to extract assessment information
*/
 
/*
* node.js requires:    
* 'cheerio', ('../logger').appLogger
*
* browser requires:
* jQuery
*
* notice that for cheerio: $(this) == this -> true
* but in jquery the above result infalse, this why you see the
* following at various places:
* var $this = $(this);
*/
'use strict';

//shared requires
var when      = require('when')
  , _         = require('lodash')
  , isBrowser = require('../utils/shared').isBrowser()

  //to be set (if needed)
  , jQuery
  , cheerio
  , logger
  , getOuterHTML ;

//private function to initialize environment
(function configureEnv_(){
  //choose appropriate configuration
  isBrowser ? configure4Browser_() : configure4Node_();

})();

function configure4Node_(){
  cheerio = require('cheerio');
  logger = require('../logger').appLogger;

  getOuterHTML = function($, $el) {
    return $.html($el)
  };
}

function configure4Browser_(){
  jQuery = require('jQuery');
  logger = console;

  getOuterHTML = function($, $el) {
    $($('<div></div>').html($el.clone())).html();
  };
}

var Parser = module.exports = function(){
  // default options for template names, selectors etc.
  this.defaultOptions={
    outputFormat : 'Array',
    //TODO: test this
    defaultMultiChoiceInput: 'checkbox',
    questionSelectors: {
      multiChoice : 'multi-choice',
      codeInput : 'code-input',
      textInput : 'text-input',
      highlight : 'highlight'
    },
    inputTypeSelectors: {
      sel1      : 'choose-1',
      sel0_n    : 'choose-0-n',
      sel1_n    : 'choose-1-n',
    }
  };

  this.options={};
  //placeholder for the dom manipulation library
  this.$ = null;
};


(function(){

  // input types are determined by the last encountered
  // valid class name 
  this.findFormInputType = function (classList){
    var formButtonType = ''
      , opts = this.options
      , classArray = classList.split(/\s+/);

      for (var i in classArray) {
        if (classArray[i] === opts.inputTypeSelectors.sel1) {
           formButtonType = 'radio';
        }
        else if ((classArray[i] === opts.inputTypeSelectors.sel0_n) || (classArray[i] === opts.inputTypeSelectors.sel1_n)){
          formButtonType = 'checkbox';
        }
        else{
          formButtonType = opts.defaultMultiChoiceInput;
        }
      }
    return(formButtonType)
  }

  this.getQuestionClasses = function($el){
    var classes = []
      , opts = this.options;

    for (var key in opts.questionSelectors){
      if ($el.hasClass(opts.questionSelectors[key])){
        classes.push(opts.questionSelectors[key]);
      }
    }
    return classes;
  }

  this.parseMultiChoice = function($, $el, opts, errors){
  //options for each question
    var questionOptions = []
      , opts = this.options;

    //get options  
    $el.find('li').each(function(){
      var $this = $(this);

      questionOptions.push({ 
        text: $this.html(), 
        classList: $this.attr('class'),
        correct: $this.attr('data-correct')== 'true' ? true:false
      });       
    }); 

    // find input types
    var inputType = this.findFormInputType($el.attr('class'), opts);
    if (inputType ===''){
      var optSels = opts.inputTypeSelectors;
      var validSelectors = optSels.sel1 + ' ' + optSels.sel0_n + ' ' + optSels.sel1_n ;
      errors = pushError(errors, 'No valid input type selectors for question. Valid types are: ' + validSelectors)
    }

    // find parent slide id
    var parentSlideId;
    var $slideParent = $el.parents('.step');
    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var question = {
      stem : getOuterHTML($, $el.find('.stem')),
      stemText: $el.find('.stem').html(),
      htmlId: $el.attr('id'),
      slideHtmlId : parentSlideId,
      questionType: 'multi-choice', 
      formButtonType : inputType,
      questionOptions : questionOptions 
    };

    return question;
  }

  this.parseTextInput = function ($, $el, opts, errors){
    // find parent slide id
    var parentSlideId
      , $slideParent = $el.parents('.step');

    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var $stem =$el.find('.stem')
      , answer = $stem.attr('data-correct-answer')
      , question = {
        stem : getOuterHTML($, $stem),
        stemText: $stem.html(),
        htmlId: $el.attr('id'),
        slideHtmlId : parentSlideId,
        questionType: 'text-input',
        correctAnswer : typeof answer== 'undefined' ? null : answer 
      };

    return question;
  }

  this.parseCodeInput = function ($, $el, opts, errors){
    // find parent slide id
    var parentSlideId
      , $slideParent = $el.parents('.step');

    if($slideParent.length>0){
      parentSlideId = $slideParent.attr('id') ? $slideParent.attr('id'):'';
    }

    var $stem =$el.find('.stem')
      , answer = $stem.attr('data-correct-answer')
      , question = {
        stem : getOuterHTML($, $stem),
        stemText: $stem.html(),
        htmlId: $el.attr('id'),
        slideHtmlId : parentSlideId,
        questionType: 'code-input',
        correctAnswer : typeof answer== 'undefined' ? null : answer 
      };

    return question;
  }


  // search for selector starting from root
  // module.exports.findFromRoot = function($el, selector) {
  //  console.log($el.find(selector))
  //  // return $el.filter(selector).add($el.find(selector));
  // }

  this.parse = function(html, options, callback){

    //configure dom selector lib implementation
    var $ = this.$ = isBrowser ? jQuery : cheerio.load(html);

    //argument overload
    options = options==undefined? {} : options;

    // Support callback as second arg.
    if (typeof options === 'function') {
        callback = options;
        options  = {};
    }

    if(typeof options !== "undefined" && typeof options != 'Function'){
      _.extend(this.options, this.defaultOptions, options);
    }

    var opts= this.options;

    var deferred = when.defer(),
      start = new Date(),
      questions = opts.outputFormat == 'Array'? [] : {},
      stats = [],
      errors = null,
      data = null;


      // assessments parsing
      var $assessment = $('.assessment')
        , self= this;


      $assessment

        // filter already processed elements
        .filter(function() {
          return $(this).find('form').length === 0;
        })

        .each(function(){
           var $this = $(this);

          //check for empty ids
          if($this.attr('id')== undefined || $this.attr('id').trim() ==''){
          //  logger.warn('Warning: Found Question without id. Will add random id');
            errors = pushError(errors, 'found question without id');
            //errors = [{'error': new Error('found question without id')}]
            //logger.warn('Warning: Found Question without id. Will add random id');

            //TODO: try 5 times to assign a random id
            // the following code tries to assign a random id. For now disabled
            // because we have to see if we will save the html file.
            /*for (var i=0; i<5; i++){
              newId = 'question-' + Math.floor( Math.random()*999999 );
              if( $('#'+newId).length == 0){
                $this.attr('id',newId);
                console.log("Assigned id: " + newId);
                break;
              }else if(i==4){
                errors = [{'error':  'Failed to assign newId'}]
                
                //break .each()
                return false;

              }
            }*/
          }


          // check for double question ids
          var ids = $('.assessment[id="'+ $this.attr('id')+'"]');
          if(ids.length>1 ){
             errors = pushError(errors, 'Multiple IDs #'+$this.attr('id'))
            return false;
          }

          // check for multiple question types
          var questionClasses = self.getQuestionClasses($this);
          if(questionClasses.length > 1){
            errors = pushError(errors, 'Multiple question types: '+ questionClasses.toString());
            return false;
          }else if(questionClasses.length <1){
            errors = pushError(errors, 'Assessment has no question type')
            return false;
          }

          var questionType = questionClasses[0];
          var question;
          switch(questionType){
            case opts.questionSelectors.codeInput :
              question = self.parseCodeInput($, $this, opts, errors);
              break;

            case opts.questionSelectors.multiChoice :
              question = self.parseMultiChoice($, $this, opts, errors);
              break;

            case opts.questionSelectors.textInput :
              question = self.parseTextInput($, $this, opts, errors);
              break;
          }

          opts.outputFormat == 'Array'? questions.push(question) : questions[$this.attr('id')]=question;
      
      })

    //stats parsing
    $('.stats').each(function(){
      var $this = $(this); 
      stats.push({
        questionHtmlId  : $this.attr('data-target-assessment'),
        slideHtmlId     : $this.parents('.step').attr('id')
      });
    })
    
    if(!errors) {
      data ={
        questions : questions,
        stats     : stats
      }; 
    }
    returnData(errors, data, callback, deferred, logger, start)
    return deferred.promise;
  }

}).call(Parser.prototype)




// instantiates error array if not instantiated
// and pushes the error
function pushError(errorArray, error){
  if (! errorArray){
    errorArray = [];
  }
  errorArray.push(error);
  return errorArray
}

// returns date either by callback or promise
// copied from https://github.com/glennjones/microformat-node/
// full credit goes to Glenn Jones
function returnData(errors, data, callback, deferred, logger, start){
  if(errors){
   logger.error(JSON.stringify(errors));
  }
  if(start){
    logger.info('ASQ parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
  }
  if(callback && (typeof(callback) == 'function')){
    callback(errors, data);
  }else{
    if(errors){
      deferred.reject(errors);
    }else{
      deferred.resolve(data);
    }
  }
}