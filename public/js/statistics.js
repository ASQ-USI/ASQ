var connect = function(host, port, session, mode) {
	var started = false;
	var socket = io.connect('http://' + host + ':' + port + '/ctrl');

	socket.on('connect', function(event) {
		socket.emit('asq:admin', {
			session : session
		});

		/**
		 Handle socket event 'new'
		 Notifies the admin of a new connection to the presentation.
		 */
		socket.on('asq:submit', function(event) {
			console.log("You've got an answer!");
			var questionId = event.questionId;

			for (var key in statsTypes) {
				requestStats(questionId, statsTypes[key])
			}
			console.log("newdata")
			//drawChart();

		});

	});
}

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
			
		},
	},

	distinctOptions : {
		metric : "distinctOptions",
		data : [],
		chart : [],
		options : {
			title : 'How often was a group of options selected',
			
			isStacked : true,
			legend : {
				position : 'top',
				alignment : 'center'
			},
			animation : {
				duration : 500,
				easing : 'out'
			},
		},
	},

	distinctAnswers : {
		metric : "distinctAnswers",
		data : [],
		chart : [],
		options : {
			title : 'How often was an option selected',
			isStacked : true,
			
			legend : {
				position : 'top',
				alignment : 'center'
			},
			animation : {
				duration : 500,
				easing : 'out'
			},
		},
	}
};

function drawChart() {
	$('.stats').each(function(el) {
		var questionId = $(this).data('target-assessment-id');
		statsTypes.rightVsWrong.chart[questionId] = new google.visualization.PieChart($(this).find(".rvswChart-"+questionId)[0]);
		statsTypes.distinctOptions.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctOptions-"+questionId)[0]);
		statsTypes.distinctAnswers.chart[questionId] = new google.visualization.ColumnChart($(this).find(".distinctAnswers-"+questionId)[0]);
	})
}


$('a[data-toggle="tab"]').on('shown', function(e) {
	var questionId = $(this).parents(".stats").data('target-assessment-id');

	for (var key in statsTypes) {
		requestStats(questionId, statsTypes[key])
	}
});

$("#session").change(function() {

	$('.stats').each(function(el) {
		var questionId = $(this).data('target-assessment-id');
		for (var key in statsTypes) {
			requestStats(questionId, statsTypes[key])
		}
		console.log("Session change: newdata for " + questionId);
	});
});

function requestStats(questionId, obj) {
	var session = "";
	console.log($("#session").val());
	if ($("#session").val() != "null") {
		session = "&session=" + $("#session").val();
	};
	$.getJSON('/stats/getStats?question=' + questionId + '&metric=' + obj.metric + session, function(data) {
		obj.data[questionId] = google.visualization.arrayToDataTable(data);
		obj.chart[questionId].draw(obj.data[questionId], obj.options);
	});
}
