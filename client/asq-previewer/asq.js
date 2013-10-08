/** @module client/asq-previewer/asq.js
    @description Previewer for assessment microformat
*/

require('when/monitor/console');
var Parser = require('../../lib/assessment/parser')
  , logger = console
  , MarkupGenerator = require('../../lib/assessment/markupGenerator')
  , _ = require('underscore')

function init(cb){
  throw(new Error('my wrro'))
  //detect if we need to render anything or the user is just chilin
  var search = window.location.search
  if(search.match(/viewer/)){
    start('viewer',cb);
  }else if(search.match(/presenter/)){
    start('presenter',cb);
  }else{
    if (typeof cb !== "undefined" && typeof cb == "function"){
      cb.call(this, null, true)
    }
  }
}


function start(userType, cb){
  //parse
  var asqParser = new Parser();
  asqParser.parse('')
    .then(
      function(parsedData){
        parsedData = fakeDatabaseIds(parsedData);

        //render
        var asqRenderer = new MarkupGenerator()
        return asqRenderer.render('', parsedData.questions,
                                    { 
                                      userType: userType,
                                      mode: "preview"
                                    });
      })
    .then(
      function(html){
        randomize();
        console.log()
        if (typeof cb !== "undefined" && typeof cb == "function"){
          cb.call(this, null, true)
        }
      },
      function(err){
          logger.error(err)
          if (typeof cb !== "undefined" && typeof cb == "function"){
            cb.call(this, err)
          }
      });
}

function fakeDatabaseIds(data){
  var questions = data.questions
    , stats = data.stats
    , id =0;

  _.each(questions, function(question, index){
    question.id = id++

     // push questions mongo ids to corresponding questions
    _.each(stats, function(stat){
      if(stat.questionHtmlId == question.htmlId){
        stat.questionId = question.id;
      }
    });
  });

  return data;
}

function randomize(){
  $('.progress .bar').each(function(){
    var width = Math.floor(Math.random() * (90 - 10 + 1)) + 10;
    $(this).attr('style', 'width:' + width.toString() + '%;')
  })
}

module.exports = {
  init: init
};