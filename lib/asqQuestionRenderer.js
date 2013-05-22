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
    student: 'questionList-student.dust', 
    stats  : 'stats.dust', 
    answer  : 'answer.dust', 
  }
};

var initScript = '<script>' ;
initScript += 'window.onload = function() {' ;
initScript += 'impress().init();' ;
initScript += 'connect( "{host}" , {port} , "{id}", "view");' ;
initScript += 'impress().start();';
initScript += '}' ;
initScript += '</script>' ;



function renderOne($el, question, type){
  var deferred = when.defer();

  var template = defaultOptions.template[type]
  if(template === undefined){
    deferred.reject(new Error("Invalid template type"));
  }

  // dustfs.dirs('dusts/'); // Read templates from that sub directory

  dustfs.render(template, question, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

    $el.find('ol').replaceWith(out);
    deferred.resolve(out);
  });

  return deferred.promise;
}

function renderStat($stat){
  var deferred = when.defer();
  dustfs.render(defaultOptions.template.stats, {}, function(err, out) {
    if(err) {
      deferred.reject(err)
    }
    $stat.html(out);
    deferred.resolve(out);
  });
  return deferred.promise;
}

function renderAnswer($stat){
  var deferred = when.defer();
  dustfs.render(defaultOptions.template.answer, {}, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

    $stat.html(out);
    deferred.resolve(out);
  });
  return deferred.promise;
}

function renderAll($, questions, type){
    var deferreds = [];

    dustfs.dirs('dusts/'); // Read templates from that sub directory

    _.each(questions, function(question){
      deferreds.push(renderOne($('#' + question.htmlId), question, type));
    })

    $('body').append('<script src="/socket.io/socket.io.js"></script>');

    //if teacher render stat slides
    if(type === "teacher"){

      //add teacher scripts       
      $('script[src$="impress.js"]')
        .attr('src', "/js/impress-admin.js" )
        .before('<script src="/socket.io/socket.io.js"></script>\n')
        .after('\n<script src="/js/admin.js"></script>')

      _.each($('.stats'), function(stat){
        deferreds.push(renderStat($(stat)));
      });

    }else{ //we are not admin so render answer slides


        //add student scripts
      $('script[src$="impress.js"]')
        .attr('src', "/js/impress-viewer.js" )
        .before('<script src="/socket.io/socket.io.js"></script>\n')
        .after('\n<script src="/js/viewer.js"></script>');

      _.each($('.stats'), function(stat){
        deferreds.push(renderAnswer($(stat)));
      });

    }

    // initialize impress and sockets
    $('body').append(initScript);

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