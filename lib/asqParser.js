/** @module lib/asqParser
    @description Parse HTML files to extract assessment information
*/

var cheerio = require('cheerio')
, sugar     = require('sugar')
, when      = require('when')
, logger    = require('./logger.js')
, _         = require("underscore")

// default options for template names, selectors etc.
, defaultOptions={
  outputFormat : 'Array',
  logLevel  : 4,
  inputTypeSelectors: {
    sel1      : 'choose-1',
    sel0_n    : 'choose-0-n',
    sel1_n    : 'choose-1-n',
  }
};

module.exports = exports = {
  parse   : parse
}


// input types are determined by the last encountered
// valid class name 
function findFormInputType(classList, options){
  var formButtonType="",
    classArray = classList.split(/\s+/);
    for (var i in classArray) {
      if (classArray[i] === options.inputTypeSelectors.sel1) {
         formButtonType = "radio";
         break;
      }
      if ((classArray[i] === options.inputTypeSelectors.sel0_n) || (classArray[i] === options.inputTypeSelectors.sel1_n)){
        formButtonType = "checkbox";
      }
    }

  return(formButtonType)
}


// search for selector starting from root
// module.exports.findFromRoot = function($el, selector) {
//  console.log($el.find(selector))
//  // return $el.filter(selector).add($el.find(selector));
// }

function parse(html, options, callback){
  //argument overload

  options = options==undefined? {} : options;

  // Support callback as second arg.
  if (typeof options === 'function') {
      callback = options;
      options  = {};
  }

  if(options && typeof(options) != "Function"){
    var tempObj={};
    _.extend(tempObj, defaultOptions, options);
    options = tempObj;
  }

  var $ = cheerio.load(html),
    deferred = when.defer(),
    start = new Date(),
    questions = options.outputFormat == 'Array'? [] : {},
    errors = null,
    data = null;

    logger.setLogLevel(options.logLevel);


    $('.multi-choice')

    // filter already processed elements
    .filter(function() {
      return $(this).find('form').length === 0;
    })

    .each(function(){

      //check for empty ids
      if(this.attr('id')== undefined || this.attr('id').trim() ==''){
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
            this.attr('id',newId);
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
      var ids = $('.multi-choice[id="'+ this.attr('id')+'"]');
      if(ids.length>1 ){
         errors = pushError(errors, 'Multiple IDs #'+this.attr('id'))
        //errors = [{'error': new Error('Multiple IDs #'+this.attr('id'))}]
        
        //break .each()
        return false;
      }

      //options for each question
      var questionOptions = [];

      //get options  
      this.find('li').each(function(){
        questionOptions.push({ text: this.html(), classList:this.attr('class'), correct: false})       
      }); 

      // find input types
      var inputType = findFormInputType(this.attr('class'), options);
      if (inputType ===""){
        var optSels = options.inputTypeSelectors;
        var validSelectors = optSels.sel1 + ' ' + optSels.sel0_n + ' ' + optSels.sel1_n ;
        errors = pushError(errors, 'No valid input type selectors for question. Valid types are: ' + validSelectors)
      }

      var question = {
        stem : $.html(this.find('.stem')),
        htmlId: this.attr('id'),
        questionType: "multi-choice", 
        formButtonType : inputType,
        questionOptions : questionOptions 
      };
      options.outputFormat == 'Array'? questions.push(question) : questions[this.attr('id')]=question
  
  })
  
  if(!errors) {
    data = questions;
  }

  returnData(errors, data, callback, deferred, logger, start)
  return deferred.promise;
}

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
    logger.log('ASQ parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
  }
  if(callback && (typeof(callback) == "function")){
    callback(errors, data);
  }else{
    if(errors){
      deferred.reject(errors);
    }else{
      deferred.resolve(data);
    }
  }
}