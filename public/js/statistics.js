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
		},
		animation:{
        	duration: 1000,
        	easing: 'out'
      },
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
		},
		animation:{
        	duration: 1000,
        	easing: 'out'
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
	var questionId = $('.stats').data('target-assessment-id');

	for (var key in statsTypes) {
		requestStats(questionId, statsTypes[key])
	}
	console.log("newdata")
	drawChart();
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
