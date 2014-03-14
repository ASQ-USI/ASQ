/**
 @fileoverview Socket code for the viewer client.
 */

/** Connect back to the server with a websocket */
var impress = require('impressViewer')
, io = require('socket.io-browserify')
, $ = window.jQuery || require('jQuery')
, assessment = require('./assessment.js')

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
})

/** Connect back to the server with a websocket */
var connect = function(host, port, session, mode, token) {
  var started = false;
  session = session;
  socket = io.connect('http://' + host + ':' + port + '/folo?sid=' + session
    + '&token=' + token );
  
  socket.on('connect', function(event) {
    // console.log("connected")
    socket.emit('asq:viewer', {
      session : session,
      mode : mode
    });
    $('.asq-welcome-screen h4').text("You are connected to the presentation.");

    socket.on('asq:start', function(event) {
      if (!started) {
        console.log('started');
        $('#welcomeScreen').modal('hide');
        started = true;
      }
    });

    socket.on('disconnect', function(event){
        console.log('disconnected')
    })

    socket.on('asq:question', function(event) {
      questionId = event.question._id;
      showQuestion(event.question);
      console.log("Wohoo a Question is coming!");
    });

    socket.on('asq:answer', function(event) {
      showAnswer(event.question);
    });

    socket.on('asq:hide-answer', function(event) {
      $('#answer').modal('hide');
    });

    /**
     Handle socket event 'goto'
     Uses impress.js API to go to the specified slide in the event.
     */
    socket.on('asq:goto', function(event) {
      impress().goto(event.slide);
      //$('#answer').modal('hide');
    });

    /**
     Handle socket event 'goto'
     Uses impress.js API to go to the specified slide in the event.
     */
    socket.on('asq:gotosub', function(event) {
      impress().gotoSub(event.substepIndex);
    });

    socket.on('asq:stat', function(event) {
      //console.log(event)
      for (var i = 0; i < event.questions.length; i++) {
        var question = event.questions[i];
        $this = $("[target-assessment-id='" + question._id + "'] .answersolutions");
        $this.find(".feedback").remove();

        //Search for answers for this question
        var answerArray = $.grep(event.answers, function(e) {
          return e.question == question._id;
        });

        if (answerArray.length == 1) {
          if (answerArray[0].correctness == 100) {
            $this.append('<p class="feedback"><strong>&#x2713;&nbsp; Your submission is correct!</strong></p>');
          } else {
            $this.append('<p class="feedback"><strong>&#10007;&nbsp; Your submission is wrong.</strong></p>');
          }
        }

        if (answerArray.length == 1 && question.questionType == "multi-choice") {
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
        } else if (answerArray.length == 1 && question.questionType == "text-input") {
          $this.append('<p class="feedback">Your submission: ' + answerArray[0].submission[0] + '<br/>Solution: ' + question.correctAnswer + '</p>');
        } else {
          $this.append('<p class="feedback">No Answer recived!</p>');
        }
      };

    });

    socket.on('asq:session-terminated', function(event) {
      console.log('session terminated')
      $('body').append('<div style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.8);"><h2 style="color: white; text-align: center; margin-top: 50px">This presentation was terminated.</h2><p style="color: white; text-align: center;">To reconnect try refreshing your browser window.</p></div>');
    });

  })
  .on('connect_failed', function(reason) {
    console.error('unable to connect to namespace', reason);
    $('.asq-welcome-screen h4').text("ERROR - Connection could not be established!");
  })

  .on('error', function (reason){
    console.error('Unable to connect Socket.IO', reason);
  });;

  document.addEventListener('local:resubmit', function(event) {
    socket.emit('asq:resubmit', {
      questionId : questionId
    });
  });
}
var showQuestion = function(question) {
  $('#blockOptions').css("display", "none");
  $('#changeAnswer').css("display", "none");
  $('#sendanswers').removeAttr("disabled");

  $('#questionText').html('<h3>' + question.questionText + '</h3><button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>');
  var optionsstring = '';
  if (question.questionType === "Multiple choice") {
    optionsstring = '<span class="help-block">Please select all correct answers.</span>';
    for (var i = 0; i < question.answeroptions.length; i++) {
      optionsstring += '<label class="checkbox"><input type="checkbox" id="checkbox' + i + '">' + question.answeroptions[i].optionText + '</label>';
    }

  } else {
    optionsstring = '<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
    optionsstring += '<input type="text" id="textbox" placeholder="Your solution...">';
  }

  $('#answeroptions').html(optionsstring);
  $('#question').modal('show');
}
var showAnswer = function(question) {
  $('#answerText').html('<h3>Statistics for</h3><h4>"' + question.questionText + '"</h4> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>');

  var optionsstring = [];
  if (question.questionType === 'Multiple choice') {
    for (var i = 0; i < question.answeroptions.length; i++) {
      optionsstring.push('<label class="checkbox" >');
      if (question.answeroptions[i].correct === true) {
        optionsstring.push('<i class="icon-ok"> </i>');
      } else {
        optionsstring.push('<i class="icon-remove"> </i>');
      }
      optionsstring.push(question.answeroptions[i].optionText)
      optionsstring.push('</label>');
    }

  } else {
    optionsstring.push('<span class="help-block">Correct answer.</span>');
    optionsstring.push('<p></p>');
    optionsstring.push('<span class="help-block">Your answer.</span>');
    optionsstring.push('<input type="text" value="Norway" readonly>');
  }

  $('#answersolutions').html(optionsstring.join(''));
  //$('#answer').on('show', function() {
  //   $('#question').on('hidden', function() {/*nothing*/});
  //});
  $('#question').on('hidden', function() {
    $('#answer').modal('show')
  });
  $('#question').modal('hide');
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

  // form submission events
  $(document).on('submit', '.assessment form', function(event) {
    event.preventDefault();
    var $this = $(this);

    var questionId = $this.find('input[type="hidden"][name="question-id"]').val()
    console.log("QuestionID= " + questionId);

    $this.children().css('opacity', '0.5').end().find('input').attr('disabled', 'true').end().find('button:not(.changeanswer .btn)').attr('disabled', 'true').fadeOut(function() {
      $this.append('<div class="changeAnswer" style="display: none"><p><button class="btn btn-primary">Modify answer</button>&nbsp; &nbsp; <span class="muted"> ✔ Your answer has been submitted.<span></p></div>')
      $this.find('.changeAnswer').fadeIn();
    });

    //get question id
    var questionId = $(this).find('input[type="hidden"][name="question-id"]').val()

    //aggregate answers
    var answers = [];
    $(this).find('input[type=checkbox], input[type=radio]:not(.asq-rating-input)').each(function() {
      answers.push($(this).is(":checked"));
    })

    $(this).find('input[type=text]').each(function() {
      answers.push($(this).val());
    })

    $(this).find('.asq-code-editor').each(function() {
      console.log(ace.edit(this.id).getSession().getValue())
      answers.push(ace.edit(this.id).getSession().getValue());
    })

    // Get confidence score
    var score = $('input.asq-rating-input:checked').val() || -1;

    socket.emit('asq:submit', {
      session : session,
      answers : answers,
      score   : score,
      questionId : questionId
    });
    console.log('submitted answer for question with id:' + questionId);
    console.log('Answer');
    console.dir(answers);
    console.dir(score);
  })
})

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
    var questionId = $(this).attr('target-assessment-id');
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


$('a[data-toggle="tab"]').on('shown', function(e) {

  var questionId = $(this).parents().find(".stats").attr('target-assessment-id');
  var $question = $('.assessment[question-id='+questionId+']');

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
