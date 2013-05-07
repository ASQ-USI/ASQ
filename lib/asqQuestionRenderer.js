/** @module lib/asqParser
    @description Parse HTML files to extract assessment information
*/

var cheerio = require('cheerio')
, sugar     = require('sugar')
, when      = require('when')
, logger    = require('./logger.js')
, _         = require("underscore")
, dustfs    = require('dustfs')
//, dust      = require('dust');

// default options for template names, selectors etc.
, defaultOptions={
  outputFormat : 'Array',
  logLevel  : 4,
  template : {
    teacher: 'questionList-teacher.dust',
    student: 'questionList-student.dust'
  }
};



function renderOne($el, question, type){
  var deferred = when.defer();

  var template = defaultOptions.template[type]
  if(template === undefined){
    deferred.reject(new Error("Invalid template type"));
  }

  dustfs.dirs('dusts/'); // Read templates from that sub directory

  dustfs.render(template, question, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

    $el.find('ol').replaceWith(out);
    deferred.resolve(out);
  });

  return deferred.promise;
}

function renderAll($, questions, type){
    var deferreds = [];

    _.each(questions, function(question){
      deferreds.push(renderOne($('#' + question.htmlId), question, type));
    })

  return when.all(deferreds);

}

function render(html, questions, type){
  var $ = cheerio.load(html)
  , deferred = when.defer();

  renderAll($, questions, type).then(function(){
    deferred.resolve($.html());
  },
  function(err){
    deferred.reject(error);
  })

  return deferred.promise;
}

module.exports = {
  render : render
}