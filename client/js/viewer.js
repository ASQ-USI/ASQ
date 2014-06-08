/**
 @fileoverview Socket code for the viewer client.
 */

/** Connect back to the server with a websocket */
var impress = require('impressViewer')
, io = require('socket.io-browserify')
, $ = require('jquery')
, manager    = require('asq-visualization').Manager()
, assessment = require('asq-microformat').assessment;

// Save current question id;
var questionId = null, socket, session;

$(function(){
  var $body     = $('body')
    , host      =  $body.attr('asq-host')
    , port      = parseInt($body.attr('asq-port'))
    , sessionId = $body.attr('asq-session-id')
    , mode      = $body.attr('asq-socket-mode')
    , token     = $body.attr('asq-token');

  assessment.initCodeEditors();

  impress().init();
  connect(host, port, sessionId, mode, token)
});

/** Connect back to the server with a websocket */
var connect = function(host, port, session, mode, token) {
  var started = false;
  var socket = io.connect('http://' + host + ':' + port + '/folo?sid=' + session);
    //+ '&token=' + token ); TODO use token for socket auth.

  socket.on('connect', function(evt) {
    // console.log("connected")
    socket.emit('asq:viewer', {
      session : session,
      mode : mode
    });
    $('.asq-welcome-screen h4').text("You are connected to the presentation.");

    socket.on('asq:start', function(evt) {
      if (!started) {
        console.log('started');
        // $('#welcomeScreen').modal('hide');
        started = true;
      }
    });

    socket.on('disconnect', function(evt) {
        console.log('disconnected')
    });

    /**
     Handle socket event 'goto'
     Uses impress.js API to go to the specified slide in the event.
     */
    socket.on('asq:goto', function(evt) {
      // Handle stats
      if (!! evt.stats) {
        $.each(evt.stats, function forGraphs(id, graphs) {
          var selector = '#' + evt.slide + ' [data-target-asq-question-id="' +
          id + '"] .asq-viz-graph';
          $.each(graphs, function forData(graphName, data) {
            manager.update(selector, graphName, data);
          });
        });
      }
      impress().goto(evt.slide);
    });

    /**
     Handle socket event 'goto'
     Uses impress.js API to go to the specified slide in the event.
     */
    socket.on('asq:gotosub', function(evt) {
      impress().gotoSub(evt.substepIndex);
    });

    /**
     Indicate a submission was accepted.
     **/
    socket.on('asq:submitted', function sumbitted(evt) {
      if (!evt.exercise || ! evt.status) { return; }
      // saved submission of exercise.
      var $exercise = $('.asq-exercise[data-asq-exercise-id="' +
          evt.exercise + '"]');
        // Remove waiting message
      if (evt.status === 'success') {
        // If the server replies quickly we try to remove the wait message
        // before it is inserted.
        setTimeout(function() {
          $exercise.siblings('.asq-submit-wait').fadeOut(200).remove();
        }, 600);
        // Add confirmation message
        $([
          '<span class="asq-submit-success"><span class="label label-success">',
          '<i class="glyphicon glyphicon-ok"></i>',
          ' Answer submitted successfully.</span></span>'
          ].join(''))
          .insertAfter($exercise).fadeIn(600);
      }
      if (evt.resubmit && $exercise.siblings('.asq-resubmit-btn').length === 0) {
        $([
          '<button class="btn btn-primary asq-resubmit-btn">',
          '<i class="glyphicon glyphicon-repeat"></i>',
          ' Resubmit.</span></span>'
          ].join(''))
          .insertAfter($exercise).fadeIn(600);
      }
    });

    socket.on('asq:assess', function assess(evt) {
      if (! evt.html || ! evt.exercise) { return; } // Assessment expect the html and exercise
      var $exercise = $('.asq-exercise[data-asq-exercise-id="' +
          evt.exercise + '"]');
      // Remove messages
      $exercise.siblings(
        '.asq-submit-wait,.asq-submit-success,.asq-resubmit-btn').fadeOut(200)
        .remove();
      // Hide the exercise
      $exercise.fadeOut(600);
      $(evt.html)
        .insertAfter($exercise)
        .hide()
        .fadeIn(600, function() {
          $(this).find('.asq-flex-handle').drags();
          console.log('should not be called twice')
          $exercise.closest('.step').asqExpandSlide();
        });
    });

    socket.on('asq:stat', function(evt) {
      //console.log(evt)
      for (var i = 0; i < evt.questions.length; i++) {
        var question = evt.questions[i];
        var $this = $("[target-assessment-id='" + question._id + "'] .answersolutions");
        $this.find(".feedback").remove();

        //Search for answers for this question
        var answerArray = $.grep(evt.answers, function(e) {
          return e.question === question._id;
        });

        if (answerArray.length === 1) {
          if (answerArray[0].correctness === 100) {
            $this.append('<p class="feedback"><strong>&#x2713;&nbsp; Your submission is correct!</strong></p>');
          } else {
            $this.append('<p class="feedback"><strong>&#10007;&nbsp; Your submission is wrong.</strong></p>');
          }
        }

        if (answerArray.length === 1 && question.questionType === 'multi-choice') {
          $this.find("li").each(function(el) {
            if (answerArray[0].submission[el]) {
              $(this).find("input").attr("checked", "true");
            } else {
              $(this).find("input").removeAttr("checked");
            }
            if (answerArray[0].submission[el] == question.questionOptions[el].correct) {
              $(this).find("input").before('<span class="feedback">&#x2713;&nbsp;</span>');
            } else {
              $(this).find("input").before('<span class="feedback">&#10007;&nbsp;</span>');
            }
          });
        } else if (answerArray.length === 1 && question.questionType === "text-input") {
          $this.append('<p class="feedback">Your submission: ' + answerArray[0].submission[0] + '<br/>Solution: ' + question.correctAnswer + '</p>');
        } else {
          $this.append('<p class="feedback">No Answer recived!</p>');
        }
      }
    });

    socket.on('asq:session-terminated', function(evt) {
      console.log('session terminated')
      $('body').append('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8);"><h2 style="color: white; text-align: center; margin-top: 50px">This presentation was terminated.</h2><p style="color: white; text-align: center;">To reconnect try refreshing your browser window.</p></div>');
    });
  }) //TODO Check if this works
  .on('connect_failed', function(reason) {
    console.error('unable to connect to namespace', reason);
    $('.asq-welcome-screen h4').text("ERROR - Connection could not be established!");
  })
  .on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });

   // Handler for answer submission
  $(document).on('submit', '.asq-exercise form', function(evt) {
    evt.preventDefault();
    var $exercise = $(evt.target).closest('.asq-exercise');

    // Get the submission from the form
    var answers = $exercise.find('.asq-question').map(function getQuestionData() {

      //get question id
      var questionId = $(this).find('input[type="hidden"][name="question-id"]').val()

      //aggregate answers
      var submission = [];
      $(this).find('input[type=checkbox]:not(.asq-rating-input), input[type=radio]:not(.asq-rating-input)').each(function() {
        submission.push($(this).is(":checked"));
      });

      $(this).find('input[type=text]').each(function() {
        submission.push($(this).val());
      });

      $(this).find('.asq-code-editor').each(function() {
        console.log(ace.edit(this.id).getSession().getValue())
        submission.push(ace.edit(this.id).getSession().getValue());
      });

      // Get confidence
      var confidence = parseInt($(this).find('input.asq-rating-input:checked')
        .val()) || 0;

      return {
        question : questionId,
        submission: submission,
        confidence : confidence,
      };
    }).get(); // Return basic array of answers

    //disable submission form
    $exercise.find(':input').attr('disabled', true);
    $exercise.find('.asq-rating').addClass('disabled');

    // fadeout questions and insert wait msg
    $exercise.fadeTo(200, 0.3, function() {
      $('<span class="asq-submit-wait"><span class="label label-default">\
        <i class="asq-spinner glyphicon glyphicon-refresh">\
        </i> Submitting your answer...</span></span>')
        .insertAfter($exercise).fadeIn(200);
    });

    //get question id
    var exerciseId = $exercise.attr('data-asq-exercise-id');
    console.log('submitted answer for exercise with id:' + exerciseId);
    console.dir(answers);

    socket.emit('asq:submit', {
      exercise : {
        id : exerciseId,
        answers : answers
      }
    });
  });

  // Handler for assessment submission
  $(document).on('submit', '.asq-assessment-inner', function(evt) {
    evt.preventDefault();
    var $assessment = $(evt.target).closest('.asq-assessment-inner');
    $assessment.find('.asq-rubric[data-asq-target-question]').each(
      function processQuestion() {
        var questionId = $(this).attr('data-asq-target-question');
        console.log('question', questionId);
        $(this).find('[data-asq-rubric]').each(
          function processRubric() {
            var rubricId = $(this).attr('data-asq-rubric');
            console.log('rubric', rubricId);
            $(this).find('.asq-rubric-list .list-group-item').each(
              function processRubricElem() {
                var score = $(this).find('.asq-rubric-elem input').val();
                var label = $(this).find('.asq-rubric-elem .label').html();
                var desc  = $(this).find('.asq-rubric-elem').last().html();
                console.log(score);
                console.log(label);
                console.log(desc);
              })
        });
      });
  });
}

$(function() {

  $(document).on("click", ".changeAnswer", function(event) {
    event.preventDefault();
    var $this = $(this).parents("form");

    var questionId = $(this).parent().parent().find('input[type="hidden"][name="question-id"]').val();
    var resubmitEvent = new CustomEvent('local:resubmit', {});
    document.dispatchEvent(resubmitEvent);

    $this.children().css('opacity', '1').end().find('input').removeAttr('disabled').end().find('.changeAnswer').fadeOut(function() {
      $(this).remove();
      $this.find('button').removeAttr('disabled').fadeIn()
    });
  });
});

google.load("visualization", "1", {
  packages : ["corechart"]
});

google.setOnLoadCallback(drawChart);

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
  $('.stats').each(function(el) {
    var questionId = $(this).attr('data-target-asq-question-id');
    console.log($(this).find(".rvswChart").length);
    if($(this).find(".rvswChart").length){
      statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart")[0]);
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
  var $question = $('.assessment[data-question-id=' + questionId + ']');

  if($question.hasClass('multi-choice')){
    for (var key in statsTypes) {
      //if chart exists
      if(statsTypes[key].chart[questionId]){
        requestStats(questionId, statsTypes[key])
      }
    }
  }
  else if($question.hasClass('text-input')){
    requestDistinct(questionId)
  }
  else if($question.hasClass('code-input')){
    requestDistinctCode(questionId);
  }

});

function requestDistinct(questionId, obj) {
  $.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
    console.log(data);
    var list = '<ul class="different-options">'
    for (var i=1; i<data.length; i++){
      var times =  data[i][2] > 1 ? '<span class="times">&nbsp;(' + data[i][2] +')</span>' : ''
      list += '<li>' + data[i][0]  + times + '</li>'
    }
    list+='</ul>'
    console.log(list)
    $('.stats[target-assessment-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
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
      '<a href="#" class="correct-btn" ><i class="icon-ok"></i></a>',
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
    $('.stats[target-assessment-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
  });
}

function requestStats(questionId, obj) {
  $.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
    obj.data[questionId] = google.visualization.arrayToDataTable(data);
    obj.chart[questionId].draw(obj.data[questionId], obj.options);
  });
}