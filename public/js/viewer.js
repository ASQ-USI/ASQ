/**
 @fileoverview Socket code for the viewer client.
 @author Jacques Dafflon jacques.dafflon@gmail.com
 */

// Save current question id;
var questionId = null, socket, session;

/** Connect back to the server with a websocket */
var connect = function(host, port, session, mode) {
	var started = false;
	session = session;
	socket = io.connect('http://' + host + ':' + port + '/folo');
	socket.on('connect', function(event) {
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

		socket.on('asq:question', function(event) {
			questionId = event.question._id;
			showQuestion(event.question);
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
				$this = $("[data-target-assessment-id='" + question._id + "'] .answersolutions");
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

	}).on('connect_failed', function(reason) {
		console.error('unable to connect to namespace', reason);
		$('.asq-welcome-screen h4').text("ERROR - Connection could not be established!");
	});

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
		$(this).find('input[type=checkbox], input[type=radio]').each(function() {
			answers.push($(this).is(":checked"));
		})

		$(this).find('input[type=text]').each(function() {
			answers.push($(this).val());
		})

		socket.emit('asq:submit', {
			session : session,
			answers : answers,
			questionId : questionId
		});
		console.log('submitted answer for question with id:' + questionId)
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
			title : 'How often was a group of options selected',
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
			title : 'How often was an option selected',
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
		var questionId = $(this).data('target-assessment-id');
		statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart")[0]);
		statsTypes.distinctOptions.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctOptions")[0]);
		statsTypes.distinctAnswers.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctAnswers")[0]);
	})
}


$('a[data-toggle="tab"]').on('shown', function(e) {
	var questionId = $(this).parents().find(".stats").data('target-assessment-id');

	for (var key in statsTypes) {
		requestStats(questionId, statsTypes[key])
	}
});

function requestStats(questionId, obj) {
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
		obj.data[questionId] = google.visualization.arrayToDataTable(data);
		obj.chart[questionId].draw(obj.data[questionId], obj.options);
	});
}
