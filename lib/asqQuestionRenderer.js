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
};



function renderOne($el, question){
  var deferred = when.defer();

  dustfs.dirs('dusts/'); // Read templates from that sub directory

  dustfs.render('questionList.dust', question, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

    $el.find('ol').replaceWith(out);
    deferred.resolve(out);
  });

  return deferred.promise;
}

function renderAll($, questions){
    var deferreds = [];

    _.each(questions, function(question){
      deferreds.push(renderOne($('#' + question.htmlId), question));
    })

  return when.all(deferreds);

}

function render(html, questions){
  var $ = cheerio.load(html)
  , deferred = when.defer();

  renderAll($, questions).then(function(){
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