/**
 @fileoverview Socket code for the viewer client.
 */

/** Connect back to the server with a websocket */
var debug = require('bows')("viewer")
  , io = require('socket.io-client')
  , $ = require('jquery')
  , manager    = require('asq-visualization').Manager()
  , microformatClient = require('asq-microformat').client;


// Save current question id;
var questionId = null, socket, session;
var client = null;

$(function(){
  var $body     = $('body')
    , host      =  $body.attr('data-asq-host')
    , port      = parseInt($body.attr('data-asq-port'))
    , sessionId = $body.attr('data-asq-session-id')
    , mode      = $body.attr('data-asq-socket-mode')
    , token     = $body.attr('data-asq-socket-token');

  microformatClient.configureMicroformatComponents('viewer');

  // impress().init();
  client = connect(host, port, sessionId, mode, token)
});

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

/** Connect back to the server with a websocket */
function connect(host, port, session, mode, token) {
  var started = false;
  this.answerSaved = false;
  this.assessmentSaved = false;
  this.isAssessing = false;
  var that = this;
  var socketUrl =  window.location.protocol + '//' + host + '/folo';
  var socket = io.connect(socketUrl, { 
    'query': 'token=' + token+'&asq_sid=' + session 
  });

  //init presentation adapter
  try{
    var offset = getUrlVars().offset || 0
    var asi = require('./presentationAdapter/adapterSocketInterface')(socket);
     require('./presentationAdapter/adapters').impressAsqFork.adapter(asi, null, false, offset);
    var impress = require('./impress-asq')
    impress().init();
  }catch(err){
    debug(err.toString + err.stack)
  }

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
        var slide = evt.slide || evt.data.step;
        $.each(evt.stats, function forGraphs(id, graphs) {
          var selector = '#' + slide + ' [data-target-asq-question-id="' +
          id + '"] .asq-viz-graph';
          $.each(graphs, function forData(graphName, data) {
            manager.update(selector, graphName, data);
          });
        });
      }
      //impress().goto(evt.slide);
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
      console.log('submitted')
      console.log(evt);
      if (!evt.type) { return; }
      if (evt.type === 'answer') {
        handleSubmittedAnswer(evt);
      } else if (evt.type === 'assessment') {
        handleSubmittedAssessment(evt);
      }
    });

    socket.on('asq:assess', function assess(evt) {
      console.log('Got assessment')
      // Assessment expect the html and exercise and user should not be assessing
      if (! evt.html || ! evt.exercise || that.isAssessing) { return; }

      // This selector also works in the expanded slide.
      var $exercise = $('.asq-exercise[data-asq-exercise-id="' +
          evt.exercise + '"]');

      // Check if exercise found
      if ($exercise.length < 1) { return; }

      //start assessment
      that.isAssessing = true;
      console.log('removing wait msgs')
      // Remove messages and previous assessments
      $exercise.siblings(
        '.asq-submit-label,.asq-resubmit-btn,.asq-assessment-container').fadeOut(200)
        .remove();

      // Hide the exercise
      $exercise.fadeOut(600);
      $(evt.html)
        .insertAfter($exercise)
        .hide()
        .fadeIn(600, function() {
          microformatClient.initCodeEditorsForAssessment();
          $(this).find('.asq-flex-handle').drags();
          //console.log('should not be called twice')
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
        submission.push(ace.edit(this.id).getSession().getValue());
      });

      $(this).find('.asq-code-input').each(function() {
        submission.push($(this).text());
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

    disableExercise($exercise);

    // fadeout questions and insert wait msg
    $exercise.fadeTo(200, 0.3);
    $('<span class="asq-submit-label"><span class="label label-default">\
        <i class="asq-spinner glyphicon glyphicon-refresh">\
        </i> Submitting your answer...</span></span>')
        .insertAfter($exercise).fadeIn(200);

    //get question id
    var exerciseId = $exercise.attr('data-asq-exercise-id');
    console.log('submitted answer for exercise with id:' + exerciseId);
    console.dir(answers);

    that.answerSaved = false;
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
    var assessment = {};
    assessment.assessee = $assessment.attr('data-asq-assessee');
    assessment.exercise = $assessment.attr('data-asq-exercise');
    assessment.questions = [];

    // Process each question
    $assessment.find('.asq-rubric[data-asq-target-question]').each(
      function processQuestion() {
        var question = {};
        question.id = $(this).attr('data-asq-target-question');
        question.answer = $(this).attr('data-asq-target-answer');
        // Get confidence
        question.confidence = $(this)
          .find('.asq-rating > input.asq-rating-input:checked').val() || 0;
        question.rubrics = [];
        // Process each rubric for the question
        $(this).find('[data-asq-rubric]').each(
          function processRubric() {
            var rubric = {}
            rubric.id = $(this).attr('data-asq-rubric');
            rubric.score = $(this).attr('data-asq-score');
            rubric.maxScore = $(this).attr('data-asq-maxscore');
            rubric.submission = [];

            // Get checked items
            $(this).find('.asq-rubric-list .list-group-item').each(
              function processRubricElem() {
                rubric.submission.push($(this).find('.asq-rubric-elem input')
                  .is(':checked'));
            });
            question.rubrics.push(rubric);
        });
        assessment.questions.push(question);
    });
    console.log(assessment);

    // disable inputs
    $assessment.find(':input').attr('disabled', true);
    $assessment.find('p.text-right > button').attr('disabled', true); //submit btn
    $assessment.find('p.text-right .asq-rating').attr('disabled', true).addClass('disabled'); //submit btn

    $assessment.fadeTo(200, 0.3);
    // console.log('add ass wait');
    $exercise = $('.asq-exercise[data-asq-exercise-id="' + $assessment.attr('data-asq-exercise') + '"]');
    $('<span class="asq-submit-label"><span class="label label-default"><i class="asq-spinner glyphicon glyphicon-refresh"></i> Submitting your assessment...</span></span>')
        .insertAfter($exercise).fadeIn(200);

    that.isAssessing = false;
    that.assessmentSaved = false;
    // Sending assessment to server
    socket.emit('asq:assess', {assessment : assessment});
  });
  return that;
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
  var $question = $('.asq-question[data-question-id=' + questionId + ']');

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

// Rubric handler to update grades on click
$(document).change('.asq-rubric-elem input', function udpateRubricScores(e) {
  var $panel =  $(e.target).closest('.panel')
  var maxScore = parseInt($panel.attr('data-asq-maxScore'));
  var val = 0;
  // Compute sum of score for radio rubrics
  if ($(e.target).attr('type') === 'radio') {
    val = parseInt(e.target.value);
  // Compute sum score for checkbox rubric
  } else if ($(e.target).attr('type') === 'checkbox') {
    $(e.target).closest('.asq-rubric-list')
    .find('.asq-rubric-elem > input[type=checkbox]:checked').each(function getRubricScore() {
      val += parseInt(this.value);
    });
  }
  // Compute score
  var deduct = $panel.attr('data-asq-deduct-points');
  val = deduct ? maxScore + val : val;

  // Update data attribute of rubric and UI
  $panel.attr('data-asq-score', val);
  $panel.find('span.label.asq-rubric-grade').html(val + '/' + maxScore);

  // Compute global score for question
  var totalScore = 0;
  var totalMaxScore = 0;
  var $group = $panel.closest('.panel-group');
  $group.children('.panel').each( function getAllRubricScores() {
    totalScore += parseInt($(this).attr('data-asq-score'));
    totalMaxScore += parseInt($(this).attr('data-asq-maxScore'));
  });

  // Update global score UI
  $group.siblings('.pull-right').find('.asq-rubrics-grade').html(totalScore + '/' + totalMaxScore);
});

/**
* Handle the acknowledgment that an answer has been saved.
* The event must have a status (evt.status) and an exercise id (evt.exercise)
* The status must be 'success; for a recently saved answer 'confirmation' to
* confirm an existing answer has been saved or 'processing' to indicate the
* answer has been received but not is currently being processed.
*/
function handleSubmittedAnswer(evt) {
  if (!evt.exercise || ! evt.status) { return; }
    // saved submission of exercise.
    var $exercise = $('.asq-exercise[data-asq-exercise-id="' +
      evt.exercise + '"]');
      // Remove waiting message
    if (evt.status === 'success') {
      client.answerSaved = true; // Ack for saved answer
    }
    if (evt.status === 'confirmation') {
      disableExercise($exercise);  //Previously submitted answer, we need to disable the question
    }
    if (evt.status === 'success' || evt.status === 'confirmation') {

      // If the server replies quickly we try to remove the wait message
      // before it is inserted.
     setTimeout(function() {
      if (client.isAssessing) { return; } // Already assessing
      $exercise.siblings('.asq-submit-label').fadeOut(200).remove();
      console.log('Adding answer ok ' + client.isAssessing)
      // Add confirmation message
      $([
        '<span class="asq-submit-label"><span class="label label-success">',
        '<i class="glyphicon glyphicon-ok"></i>',
        ' Answer submitted successfully.</span></span>'
        ].join(''))
        .insertAfter($exercise).fadeIn(200);
     }, 210);
    }
    if (evt.resubmit && $exercise.siblings('.asq-resubmit-btn').length === 0) {
      $([
        '<button class="btn btn-primary asq-resubmit-btn">',
        '<i class="glyphicon glyphicon-repeat"></i>',
        ' Resubmit.</span></span>'
        ].join(''))
        .insertAfter($exercise).fadeIn(200);
    }
}

function handleSubmittedAssessment(evt) {
  if (!evt.exercise || ! evt.status) { return; }
  var $exercise = $('.asq-exercise[data-asq-exercise-id="' +
    evt.exercise + '"]');
  if (evt.status === 'success') {
    client.assessmentSaved = true; // Ack for saved answer
    // If the server replies quickly we try to remove the wait message
    // before it is inserted.
    setTimeout(function() {
      $exercise.siblings('.asq-submit-label').fadeOut(200).remove();
      // Already assessing the next answer
      if (client.isAssessing) { return; }
      // Add confirmation message
      console.log('Adding ass ok message ' + client.isAssessing);
      $([
        '<span class="asq-submit-label"><span class="label label-success">',
        '<i class="glyphicon glyphicon-ok"></i>',
        ' Assessment submitted successfully.</span></span>'
        ].join(''))
        .insertAfter($exercise).fadeIn(200);
    }, 210);
  }
}

function disableExercise($exercise) {
  //disable submission form
  $exercise.find(':input').attr('disabled', true);
  $exercise.find('.asq-rating').addClass('disabled');
}


function requestDistinct(questionId, obj) {
  $.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
    console.log(data);
    var list = '<ul class="different-options list-group">'
    for (var i=1; i<data.length; i++){
      var times =  data[i][2] > 1 ? '<span class="times">&nbsp;(' + data[i][2] +')</span>' : ''
      list += '<li class="list-group-item">'
      list+=  data[i][0]  + times + '</li>'
    }
    list+='</ul>'
    $('.asq-stats[data-target-asq-question-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
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
    $('.asq-stats[target-assessment-id=' + questionId+']').find('.tab-pane[id^="diffAns"]').eq(0).html(list);
  });
}

function requestStats(questionId, obj) {
  if("undefined" != typeof google){
    $.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
      obj.data[questionId] = google.visualization.arrayToDataTable(data);
      obj.chart[questionId].draw(obj.data[questionId], obj.options);
    });
  }
}
