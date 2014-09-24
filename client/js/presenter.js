/**
 @fileoverview Socket code for the presenter client.
 *
 */

'use strict';

var debug = require('bows')("presenter")
, io      = require('socket.io-browserify')
, $       = require('jquery')
, manager = require('asq-visualization').Manager()
, microformatClient = require('asq-microformat').client
, EventEmitter2     = require('eventemitter2')
, eventBus          = new EventEmitter2({delimiter: ':'})
, impress;

$(function(){
  var $body   = $('body')
  , host      =  $body.attr('data-asq-host')
  , port      = parseInt($body.attr('data-asq-port'))
  , sessionId = $body.attr('data-asq-session-id')
  , mode      = $body.attr('data-asq-socket-mode')
  , token     = $body.attr('data-asq-token')
  , slidesTree = $body.attr('data-asq-slide-tree')

  microformatClient.configureMicroformatComponents('presenter', eventBus);

  connect(host, port, sessionId, mode, token, slidesTree);
})

/** Connect back to the server with a websocket */

function connect(host, port, session, mode, token, slidesTree) {
  debug('Connecting to socket server');
  var socket = io.connect(window.location.protocol + '//' + host + ':' + port + '/ctrl?sid=' + session)
  //+ '&token=' + token ); TODO use token for socket auth.

  socket.on('connect', function(event) {
    // socket.emit('asq:admin', { //unused
    //  session : session
    // });
    

    //init presentation adapter
    try{
      if("undefined" !== typeof slidesTree){
       slidesTree = JSON.parse(slidesTree) 
      }
      var asi = require('./presentationAdapter/adapterSocketInterface')(socket);
      require('./presentationAdapter/adapters').impress(asi, slidesTree);
      //Listeners are added let's include and start impress
      var impress = require('./impress')
      impress().init();
    }catch(err){
      debug(err.toString + err.stack)
    }
    

    $('.connected-viewers-number').text("0 viewers connected")

    /**
     Handle socket event 'new'
     Notifies the admin of a new connection to the presentation.
     */
    socket.on('asq:submitted', function(evt) {
      updateProgress(evt.progress);
    });

    /**
     * Update the viewers count when users connect or disconnect.
     */
    socket.on('asq:folo-connected', onASQFoloConnected);

    socket.on('asq:goto', function(evt) {
      debug('asq:goto received');
      if (mode == 'control') {
        $('.controlThumbs .thumbsWrapper .active').removeClass('active');
        $('.controlThumbs').scrollTo('.' + evt.slide, 500, {
          offset : -150
        });
        $('.controlThumbs .thumbsWrapper .' + evt.slide).addClass("active");

        var next = $('#' + evt.slide).next().attr('id');
        $('#nextSlideFrame').attr('src', '/slidesRender/' + slidesId + '/#/' + next);
      }

      // Handle stats
      if (!! evt.stats) {
        $.each(evt.stats, function forGraphs(id, graphs) {
          var slide = evt.slide || evt.data.step
          var selector = '#' + slide + ' [data-target-asq-question-id="' + id
            + '"] .asq-viz-graph';
          $.each(graphs, function forData(graphName, data) {
            console.log(data);
            manager.update(selector, graphName, data);
          });
        });

      }
    });

    socket.on('asq:gotosub', function(event) {
      impress().gotoSub(event.substepIndex);
    });

    socket.on('asq:question', function(event) {
      window.alert("Question");
      showQuestion(event.question);
    });

    socket.on('asq:answer', function(event) {
      console.log("I GOT AN ANSWER")
      console.log(event.stats)
      showAnswer(event.question, event.stats);
      //Question contains the answer.
    });

    socket.on('asq:hide-answer', function(event) {
      $('#answer').modal('hide');
    });

    socket.on('asq:new-assessment-job', function(event){
      eventBus.emit('asq:new-assessment-job', event);
    });

    socket.on('asq:assess', function(event){
      eventBus.emit('asq:assess', event);
    });

    socket.on('asq:idle-assessment-job', function(event){
      eventBus.emit('asq:idle-assessment-job', event);
    });

    socket.on('asq:session-terminated', function(event) {
      console.log('session terminated')
      $('body').append('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8);"><h2 style="color: white; text-align: center; margin-top: 100px">This presentation was terminated.</h2><p style="color: white; text-align: center;">To reconnect try refreshing your browser window.</p><p style="text-align: center;"><a href="/user">Return to presentations.</a></p></div>');
    });
  });

  /**
   Handle impress:stepgoto event
   Send a socket event to notify which slide to go to.
   */
  document.addEventListener("impress:stepgoto", function(event) {
    socket.emit('asq:goto', {
      slide : event.target.id,
      session : session
    });
  });

  /**
   Handle impress:stepgotosub event
   sSend a socket event to notify which slide subtest to go to.
   */
  document.addEventListener("impress:stepgotosub", function(event) {
    socket.emit('asq:gotosub', {
      substepIndex : event.detail.index,
      session : session
    });
  });

  document.addEventListener('asq:close', function(event) {
    socket.emit('asq:goto', {
      session : session
    });
  });

  //Shows stasts/answers
  document.addEventListener('local:show-stats', function(event) {
    socket.emit('asq:show-stats', {});
  });
  $('#stopSessionBtn').click(function() {
    socket.emit('asq:terminate-session', {
      session : session
    });
  });
}

function onASQFoloConnected(event){
  eventBus.emit('asq:folo-connected',  {
    user: { token: event.token, nickname : event.screenName }
  });
  updateViewersCount(event);
}

function updateViewersCount(event) {
  console.log('viewer count update')
  if (typeof event.connectedClients !== 'number') { return; }
  var connectedViewers = event.connectedClients;
  // Draw icons for the first 50 viewers
  var lim = connectedViewers < 50 ? connectedViewers : 50;
  $('.connected-viewers-icons').empty();
  for (var i = 0; i < lim; i++) {
    if (i % 10 === 0) {
      $('.connected-viewers-icons').append('<br />');
    } else if (i % 5 === 0) {
      $('.connected-viewers-icons').append('<span>&nbsp;&nbsp;</span>');
    }
    $('.connected-viewers-icons').append('<i class="glyphicon glyphicon-user"> </i> ');
  }

  //update viewers count
  $(".connected-viewers-number").text(connectedViewers + " viewers");
  // New viewer connected.
  if (event.screenName && event.token) {
    console.info('Viewer ' + event.screenName + ' connected');
  }
}

function updateProgress(progress) {
  console.log('update progress')
  console.dir(progress);
  var $info = $('[data-asq-exercise-id=' + progress.exercise + '].asq-exercise')
    .find('.asq-progress-info');
  var items = $info.find('.progress > .progress-bar').length;
  var audience     = progress.audience;
  var totalAnswers = audience + progress.discAnswers;
  var totalSelf    = audience + progress.discSelf;
  var totalPeer    = audience * audience - audience  + progress.discPeer;

  // Answer
  if (totalAnswers > 0 && audience > 0) {
    var answerProgress = (progress.answers / totalAnswers) * 100;
    // Progress bar
    $info.find('.progress > .asq-progress-answers')
      .removeClass('progress-bar-danger')
      .css('width', (answerProgress / items) + '%');
    // Label
    $info.find('.asq-progress-details > .row > .asq-label-answers > span')
    .removeClass('label-danger')
    .addClass('label-primary')
    .html('Answers: ' + progress.answers + '/' + totalAnswers + ' (' +
      Math.floor(answerProgress) + '%)');
  } else { // Handle answer progress when no audience
    $info.find('.progress > .asq-progress-answers')
      .addClass('progress-bar-danger')
      .css('width', (100 / items) + '%');
    // Label
    $info.find('.asq-progress-details > .row > .asq-label-answers > span')
      .removeClass('label-primary')
      .addClass('label-danger')
      .html('<i class="glyphicon glyphicon-remove-circle" \
        style="vertical-align: text-top;"></i> Answers: ' + progress.answers);
  }

  // Self-assessment
  if ($info.find('.progress > .asq-progress-self').length > 0) {
    if (totalSelf > 0 && audience > 0) {
      var selfProgress = (progress.self / totalSelf) * 100;
      // Progress bar
      $info.find('.progress > .asq-progress-self')
        .removeClass('progress-bar-danger')
        .addClass('progress-bar-warning')
        .css('width', ( selfProgress / items) + '%');
      // Label
      $info.find('.asq-progress-details > .row > .asq-label-self  > span')
        .removeClass('label-danger')
        .addClass('label-warning')
        .html('Self: ' + progress.self + '/' + totalSelf + ' (' +
          Math.floor(selfProgress) + '%)');
    } else { // Handle self-assessment progress when no audience
      $info.find('.progress > .asq-progress-self')
        .removeClass('progress-bar-warning')
        .addClass('progress-bar-danger')
        .css('width', (100 / items) + '%');
      // Label

      $info.find('.asq-progress-details > .row > .asq-label-self  > span')
        .removeClass('label-warning')
        .addClass('label-danger')
        .html('<i class="glyphicon glyphicon-remove-circle" \
          style="vertical-align: text-top;"></i> Self: ' +
          progress.self);
    }
  }

  // Peer-assessment
  if ($info.find('.progress > .asq-progress-peer').length > 0) {
    if (totalPeer > 0) {
      var peerProgress = (progress.peer / totalPeer) * 100;
      // Progress bar
      $info.find('.progress > .asq-progress-peer')
        .removeClass('progress-danger')
        .addClass('progress-success')
        .css('width', (peerProgress / items) + '%');
      // Label
      $info.find('.asq-progress-details > .row > .asq-label-peer  > span')
        .removeClass('label-danger')
        .addClass('label-success')
        .html('Peer: ' + progress.peer + '/' + totalPeer + ' (' +
          Math.floor(peerProgress) + '%)');
    } else { // Handle no peer assessment possible
      $info.find('.progress > .asq-progress-peer')
        .removeClass('progress-bar-success')
        .addClass('progress-bar-danger')
        .css('width' , (100 / items) + '%');
      $info.find('.asq-progress-details > .row > .asq-label-peer  > span')
        .removeClass('label-success')
        .addClass('label-danger')
        .html('<i class="glyphicon glyphicon-remove-circle" \
          style="vertical-align: text-top;"></i> Peer: ' +
          progress.peer);
    }
  }
}

var showStats = function() {
  var myEvent = new CustomEvent('local:show-stats', {});
  document.dispatchEvent(myEvent);
}
var showQuestion = function(question) {
  $('.progessbar').css('width', "0%");
  $('#progressNum').text('Waiting for answers!');
  $('#question').modal('show');
  $('#questionText').html('<h3>' + question.questionText + '</h3>');
  var optionsstring = '';
  if (question.questionType == "Multiple choice") {
    optionsstring = '<span class="help-block">Please select all correct answers.</span>';
    for (var i = 0; i < question.answeroptions.length; i++) {
      optionsstring += '<label class="checkbox"><input type="checkbox">' + question.answeroptions[i].optionText + '</label>';
    }

  } else {
    optionsstring = '<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
    optionsstring += '<input type="text" placeholder="Your solution...">';
  }

  $('#answeroptions').html(optionsstring);

}



if("undefined" != typeof google){

  google.load("visualization", "1", {
    packages : ["corechart"]
  });

  google.setOnLoadCallback(drawChart);
}

  var statsTypes = {

    rightVsWrong : {
      metric : "rightVsWrong",
      data : [],
      chart : [],
      options : {
        width : 800,
      }
    },

    distinctOptions : {
      metric : "distinctOptions",
      data : [],
      chart : [],
      options : {
        title : 'Different options frequency',
        width : 800,
        isStacked : true,
        legend : {
          position : 'top',
          alignment : 'center'
        }
      }
    },

    distinctAnswers : {
      metric : "distinctAnswers",
      data : [],
      chart : [],
      options : {
        title : 'Different answers frequency',
        isStacked : true,
        width : 800,
        legend : {
          position : 'top',
          alignment : 'center'
        }
      }
    }
  };

function drawChart() {
  $('.asq-stats').each(function(el) {
    var questionId = $(this).attr('data-target-asq-question-id');
    if($(this).find(".rvswChart").length){
      statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart")[0]);
      //statsTypes.correctness.chart[questionId]
    }
    if($(this).find(".distinctOptions").length){
      statsTypes.distinctOptions.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctOptions")[0]);
    }
    if($(this).find(".distinctAnswers").length){
      statsTypes.distinctAnswers.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctAnswers")[0]);
    }
  })
}

$(document).on('shown.bs.tab', 'a[data-toggle="tab"]', function(e) {
  var questionId = $(this).parents("[data-target-asq-question-id]")
    .attr('data-target-asq-question-id');

  if ($(this).html() === 'Correctness') {
    var slide = $(this).parents('.step.active').attr('id');
    if (! slide) { return; } //Trying to render stats on a different slide

    var selector = '#' + slide + ' [data-target-asq-question-id="' + questionId
      + '"] .asq-viz-graph';
    manager.render(selector, 'correctness');
    return;
  }

  // TODO Burn the code below which is buggy and and ugly.
  var $question = $('.asq-question[data-question-id='+questionId+']');

  if($question.hasClass('multi-choice')){
    for (var key in statsTypes) {
      //if chart exists
      if(statsTypes[key].chart[questionId]){
        requestStats(questionId, statsTypes[key])
      }
    }
  }
  else if($question.hasClass('text-input') 
    || $question.hasClass('asq-css-select')
    || $question.hasClass('asq-js-function-body')){
    requestDistinct(questionId)
  }
  else if($question.hasClass('code-input')){
    requestDistinctCode(questionId);
  }

});

function requestDistinct(questionId, obj) {
  $.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
    console.log(data);
    var list = '<ul class="different-options list-group">'
    for (var i=1; i<data.length; i++){
      var times =  data[i][2] > 1 ? '<span class="times">&nbsp;(' + data[i][2] +')</span>' : ''
      list += '<li class="list-group-item">'
      list += '<a href="#" class="correct-btn" ><i class="glyphicon glyphicon-ok"></i></a>'
      list+=  data[i][0]  + times + '</li>'
    }
    list+='</ul>'
    $('.asq-stats[data-target-asq-question-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
    $('.correct-btn').click(function(){
      $(this).parent().toggleClass('correct-answer')
    })
  });
}

function requestDistinctCode(questionId, obj) {
  $.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
    var list = '<div class="accordion" id="accordion'+ questionId+'">'
    for (var i=1; i<data.length; i++){
      //var times =  data[i][2] > 1 ? '<span class="times">&nbsp;(' + data[i][2] +')</span>' : ''
      //list += '<li>' + data[i][0]  + times + '</li>'
      list += ['<div class="accordion-group">',
      '<div class="accordion-heading">',
      '<a class="accordion-toggle" data-toggle="collapse" data-parent="#accordion'+ questionId+'" href="#collapse-'+ questionId + '-' + i +'">',
      data[i][0],
      '</a>',
      '<a href="#" class="correct-btn" ><i class="glyphicon glyphicon-ok"></i></a>',
      '</div>',
      '<div id="collapse-'+ questionId + '-' + i +'" class="accordion-body collapse">',
      '<div class="accordion-inner">',
      '<pre><code>',
      data[i][0],
      '</code></pre>',
      '</div>',
      '</div>',
      '</div>'].join('');
    }

    list+='</div>'
    $('.asq-stats[data-target-asq-question-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
    //this sucks
    $('.correct-btn').click(function(){
      $(this).parent().toggleClass('correct-answer')
    })
  });
}



function requestStats(questionId, obj) {
  if("undefined" != typeof google){
    $.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
      console.log(data)
      obj.data[questionId] = google.visualization.arrayToDataTable(data);
      obj.chart[questionId].draw(obj.data[questionId], obj.options);
    });
  }
}




$(".mobileNext").click(function() {
  impress().next();
})

$(".mobilePrev").click(function() {
  impress().prev();
})

module.exports={
  connect: connect
}

