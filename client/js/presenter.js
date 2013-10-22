/**
 @fileoverview Socket code for the presenter client.
 * 
 */

'use strict'

var impress = require('impressPresenter')
, io = require('socket.io-browserify')
, $ = window.jQuery || require('jQuery')
, assessment = require('./assessment.js')

$(function(){
	var $body = $('body')
		, host 			=  $body.attr('asq-host')
    , port  		= parseInt($body.attr('asq-port'))
    , sessionId = $body.attr('asq-session-id')
    , mode 			= $body.attr('asq-socket-mode')

  assessment.initCodeEditors();

	impress().init();
	connect(host, port, sessionId, mode)
	impress().start();
})

/** Connect back to the server with a websocket */

var connect = function(host, port, session, mode) {
	var started = false;
	var socket = io.connect('http://' + host + ':' + port + '/ctrl?sid=' + session);

	var updateViewersCount = function(event) {
		if (!event.connectedClients)
			return;
		var connectedViewers = event.connectedClients;
		// Draw icons for the first 50 viewers
		var lim = connectedViewers < 50 ? connectedViewers : 50;
		$('.connected-viewers-icons').empty();
		for (var i = 0; i < lim; i++) {
			if (i % 10 == 0) {
				$('.connected-viewers-icons').append('<br />');
			} else if (i % 5 == 0) {
				$('.connected-viewers-icons').append('<span>&nbsp;&nbsp;</span>');
			}
			$('.connected-viewers-icons').append('<i class="icon-user"> </i> ');
		}

		//update viewers count
		$(".connected-viewers-number").text(connectedViewers + " viewers");
		//$('#numConnectedViewers').text(connectedViewers + '');
		console.log('New viewer connected');
	}
	socket.on('connect', function(event) {
		socket.emit('asq:admin', {
			session : session
		});

		$('.connected-viewers-number').text("0 viewers connected")

		/**
		 Handle socket event 'new'
		 Notifies the admin of a new connection to the presentation.
		 */
		socket.on('asq:submitted', function(event) {
			console.log("You've got an answer!");
			console.log(event);
			updateParticipation(event.submittedViewers, event.totalViewers, event.questionId);
		});

		/**
		 * Update the viewers count when users connect or disconnect.
		 */
		socket.on('asq:folo-connected', updateViewersCount);

		socket.on('asq:start', function(event) {
			if (!started) {
				impress().start();
				$('#welcomeScreen').modal('hide');
				$('#waitingScreen').hide();
				$('#slidesControll').show();

				started = true;
			}
		});

		socket.on('asq:goto', function(event) {
			console.log('GOTO received');
			if (mode == 'control') {
				$('.controlThumbs .thumbsWrapper .active').removeClass('active');
				$('.controlThumbs').scrollTo('.' + event.slide, 500, {
					offset : -150
				});
				$('.controlThumbs .thumbsWrapper .' + event.slide).addClass("active");

				var next = $('#' + event.slide).next().attr('id');
				$('#nextSlideFrame').attr('src', '/slidesRender/' + slidesId + '/#/' + next);
			}
			impress().goto(event.slide);
		});

		socket.on('asq:gotosub', function(event) {
			impress().gotoSub(event.substepIndex);
		});

		socket.on('asq:question', function(event) {
			window.alert("Question");
			showQuestion(event.question);
		});

		socket.on('asq:answer', function(event) {
			console.log(event.stats)
			showAnswer(event.question, event.stats);
			//Question contains the answer.
		});

		socket.on('asq:hide-answer', function(event) {
			$('#answer').modal('hide');
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

	/**
	 Handle impress:stepgoto event
	 sSend a socket event to notify which slide to go to.
	 */
	document.addEventListener("impress:start", function(event) {
		socket.emit('asq:start', {
			session : session,
			slide : $('#impress .active').attr('id')
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
function updateParticipation(submittedViewers, totalViewers, questionId) {
	var maxViewers = -1;
	if (maxViewers < totalViewers) {
		maxViewers = totalViewers;
	}

	if (maxViewers == submittedViewers) {
		$('[question-id="' + questionId + '"] .progressNum').text('All answers received (' + submittedViewers + '/' + maxViewers + '). ');
		$('[question-id="' + questionId + '"] .show-stats').attr("class", "btn btn-success");
	} else {
		$('[question-id="' + questionId + '"] .progressNum').text(submittedViewers + '/' + maxViewers + ' answers received.');
	}
	var width = (submittedViewers / maxViewers) * 100;
	$('[question-id="' + questionId + '"] .progress .bar').css('width', width + "%");
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
var showAnswer = function(question, stats) {
	console.log(stats.correct + "STATS!");
	var correct = stats.correct || null;
	var countedMcOptions = stats.countedMcOptions || null;
	var equalAnswers = stats.equalAnswers || null;
	google.load("visualization", "1", {
		packages : ["corechart"],
		callback : drawChart
	});

	//Google chart drawing for stats
	function drawChart() {
		console.log('GOOGLE CHART');
		if (question.questionType === "Multiple choice") {
			var mscstatData = google.visualization.arrayToDataTable(countedMcOptions);
		}
		var rvswData = google.visualization.arrayToDataTable(correct);
		var diffAnsData = google.visualization.arrayToDataTable(equalAnswers);

		var rvswOpt = {
			title : 'Correct vs. Wrong',
			'width' : 760,
			'height' : 400,
			chartArea : {
				left : 0,
				top : 0,
				width : "600px",
				height : "350px"
			}
		};

		var mscstatOpt = {
			animation : {
				duration : 1000
			},
			hAxis : {
				allowContainerBoundaryTextCufoff : true,
				slantedTextAngle : 50
			},
			'width' : 760,

			'legend' : {
				position : 'top',
				textStyle : {
					fontSize : 16
				}
			}
		};

		var chart3 = new google.visualization.PieChart(document.getElementById('rvswChart'));
		chart3.draw(rvswData, rvswOpt);

		if (question.questionType === "Multiple choice") {
			var chart = new google.visualization.ColumnChart(document.getElementById('mscstatChart'));
			chart.draw(mscstatData, mscstatOpt);
		} else {
			$('#mscstats').css("display", 'none');
			$('#mscstats').removeAttr('style');
			$('#mscstatsBtn').remove();
		}

		var chart = new google.visualization.ColumnChart(document.getElementById('diffAnsChart'));
		chart.draw(diffAnsData, mscstatOpt);
	}


	$('#answerText').html('<h3>Statistics for "' + question.questionText + '"</h3>');
	var optionsstring = '<h5>Correct answer:</h5>';
	if (question.questionType == "Multiple choice") {
		for (var i = 0; i < question.answeroptions.length; i++) {
			optionsstring += '<label class="checkbox" >';
			if (question.answeroptions[i].correct == true) {
				optionsstring += '<i class="icon-ok"> </i> ';
			} else {
				optionsstring += '<i class="icon-remove"> </i> ';
			}
			optionsstring += question.answeroptions[i].optionText + '</label>';
		}
	} else {
		optionsstring = '<span class="help-block">Correct answer.</span>';
		optionsstring += '<p>' + +'</p>';
		optionsstring += '<span class="help-block">Your answer.</span>';
		optionsstring += '<input type="text" value="Norway" readonly>';
	}
	//google.setOnLoadCallback(drawChart);
	//drawChart();
	//update modal content
	$('#answersolutions').html(optionsstring);
	$('#question').modal('hide');
	$('#answer').modal('show');
};

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
		var questionId = $(this).attr('target-assessment-id');
		statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart")[0]);
		statsTypes.distinctOptions.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctOptions")[0]);
		statsTypes.distinctAnswers.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctAnswers")[0]);
	})
}


$('a[data-toggle="tab"]').on('shown', function(e) {

	var questionId = $(this).parents().find(".stats").attr('target-assessment-id');
	var questionId = $(this).parents().find(".stats").attr('target-assessment-id');
	var $question = $('.assessment[question-id='+questionId+']');
console.log('#'+questionId)
console.log($question)

	if($question.hasClass('multi-choice')){
		for (var key in statsTypes) {
			requestStats(questionId, statsTypes[key])
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
		$('.stats[target-assessment-id=' + questionId+']').find('.tab-pane').eq(1).html(list);
	});
}

function requestDistinctCode(questionId, obj) {
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=distinctOptions', function(data) {
		console.log(data);
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
		$('.stats[target-assessment-id=' + questionId+']').find('.tab-pane').eq(1).html(list);
		//this sucks
		$('.correct-btn').click(function(){
      $(this).parent().toggleClass('correct-answer')
    })
	});
}



function requestStats(questionId, obj) {
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric, function(data) {
		console.log(data);
		obj.data[questionId] = google.visualization.arrayToDataTable(data);
		obj.chart[questionId].draw(obj.data[questionId], obj.options);
	});
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

