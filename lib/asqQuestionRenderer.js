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
  templates : {
    'multi-choice' : {
      'teacher' : 'questionList-teacher.dust',
      'student' : 'questionList-student.dust' 
      },
      'text-input' : {
        'teacher' : 'questionTextInput.dust',
        'student' : 'questionTextInput.dust'
      },
      'stats'  : 'stats.dust',
      'answer'  : 'answer.dust',
      'welcome-screen' : {
        'teacher' : 'welcomeScreen-teacher',
        'student' : 'welcomeScreen-student' 
      }
    }
  };

var initScriptTeacher = '<script>' ;
initScriptTeacher += 'window.onload = function() {' ;
initScriptTeacher += 'impress().init();' ;
initScriptTeacher += 'connect( "{host}" , {port} , "{id}", "{mode}");' ;
initScriptTeacher += 'impress().start();';
initScriptTeacher += '}' ;

var initScriptStudent = '<script>' ;
initScriptStudent += 'window.onload = function() {' ;
initScriptStudent += 'impress().init();' ;
initScriptStudent += 'connect( "{host}" , {port} , "{id}", "{mode}");' ;
initScriptStudent += '}' ;
initScriptStudent += '</script>' ;



function renderOne($el, question, userType){
  var deferred = when.defer();

  var template = defaultOptions.templates[question.questionType][userType]
  if(template === undefined){
    deferred.reject(new Error("Invalid template"));
  }

  // dustfs.dirs('dusts/'); // Read templates from that sub directory

  question.userType = userType;

  dustfs.render(template, question, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

   // $el.find('ol').replaceWith(out);
   $el.attr('data-question-id', question.id);
   $el.find('ol').remove();
   $el.find('.stem').after(out)
    deferred.resolve(out);
  });

  return deferred.promise;
}

function renderStat($stat){
  var deferred = when.defer();
  dustfs.render(defaultOptions.templates.stats, {}, function(err, out) {
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
  dustfs.render(defaultOptions.templates.answer, {}, function(err, out) {
    if(err) {
      deferred.reject(err)
    }

    $stat.html(out);
    deferred.resolve(out);
  });
  return deferred.promise;
}

function renderAll($, questions, userType){
    var deferreds = [];

    dustfs.dirs('views/asq-render/'); // Read templates from that sub directory

    //inject welcome-screen dust
    $('.asq-welcome-screen').html('{>"asq-render/'+defaultOptions.templates['welcome-screen'][userType]+'.dust"/}')

    // render questions
    _.each(questions, function(question){
      deferreds.push(renderOne($('#' + question.htmlId), question, userType));
    })

    $('body').append('<script src="/socket.io/socket.io.js"></script>');

    //if teacher render stat slides
    if(userType === "teacher"){

      //add teacher scripts       
      $('script[src$="impress.js"]')
        .attr('src', "/js/impress-admin.js" )
        .before('<script src="/socket.io/socket.io.js"></script>\n')
        .after('\n<script src="/js/admin.js"></script>')

      _.each($('.stats'), function(stat){
        deferreds.push(renderStat($(stat)));
      });

      // initialize impress and sockets
      $('body').append(initScriptTeacher); 

    }else{ //we are not admin so render answer slides


        //add student scripts
      $('script[src$="impress.js"]')
        .attr('src', "/js/impress-viewer.js" )
        .before('<script src="/socket.io/socket.io.js"></script>\n')
        .after('\n<script src="/js/viewer.js"></script>');

      _.each($('.stats'), function(stat){
        deferreds.push(renderAnswer($(stat)));
      });

      // initialize impress and sockets
      $('body').append(initScriptStudent);
    }

    
  return when.all(deferreds);

}

function render(html, questions, userType){
  var $ = cheerio.load(html)
  , deferred = when.defer();

  renderAll($, questions, userType).then(function(){

    // add the db ids of the questions to stats
    $('.stats').each(function(){
      var questionId = $('.assessment[id="'+ this.attr('data-target-assessment')+'"]').attr('data-question-id')
      console.log("questionId: " + questionId)
      this.attr('data-target-assessment-id', questionId);
      console.log(this.attr('data-target-assessment-id'))
    })
    
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