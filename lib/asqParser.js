/** @module lib/asqParser
    @description Parse HTML files to extract assessment information
*/

var cheerio = require('cheerio'),
  sugar     = require('sugar'),
  when      = require('when'),
  logger    = require('./logger.js'),

// options for template names, selectors etc.
  options={
  logLevel  : 4,
  selectors: {
    sel1      : 'aa-1',
    sel0_n    : 'aa-0-n',
    sel1_n    : 'aa-1-n',
  }
};


// input types are determined by the last encountered
// valid class name 
function findFormInputType(classList){
  var formButtonType="",
    classArray = classList.split(/\s+/);

    for (var name in classArray) {
      if (name === options.selectors.sel1) {
         formButtonType = "radio";

         //break 
         return false
      }
      if ((name === options.selectors.sel0_n) || (name === options.selectors.sel1_n)){
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

function parse(html, callback){
  var $ = cheerio.load(html),
    deferred = when.defer(),
    start = new Date(),
    questions = {},
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
        errors = [{'error':  'found question without id'}]
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
        errors = [{'error':  'Multiple IDs #'+this.attr('id')}]
        
        //break .each()
        return false;
      }

      //options for each question
      var questionOptions = [];

      //get options  
      this.find('li').each(function(){
        questionOptions.push({option:this.html(), classList:this.attr('class')})       
      }); 

      question = {
        stem : $.html(this.find('.stem')),
        htmlId: this.attr('id'),
        formButtonType : findFormInputType(this.attr('class')),
        options : questionOptions 
      };

      questions[this.attr('id')]=question;
  
  })
  
  if(!errors) {
    data = questions;
  }

  returnData(errors, data, callback, deferred, logger, start)
  return deferred.promise;
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


module.exports.parse = parse;