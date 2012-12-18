/**
    @fileoverview Socket code for the admin client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

/** Connect back to the server with a websocket */
var connect = function(host, port, session) {
    var started = false;
    var socket = io.connect('http://' + host + ':' + port + '/ctrl');

    var updateViewersCount = function(event){
        if (!event.users) return;
        var connectedViewers = event.users;

        // Draw icons for the first 50 viewers
        var lim = connectedViewers < 50 ? connectedViewers : 50;
        $('#viewers').empty();
        for (var i = 0; i < lim; i++) {
            if(connectedViewers % 10 == 0)
                $('#viewers').append('<br/>');
            else if(connectedViewers % 5 == 0)
                $('#viewers').append('<span>&nbsp;&nbsp;</span>');
            $('#viewers').append('<i class="icon-user"></i> ');
        }

        //update viewers count
        $("#numViewers").text(connectedViewers + " viewers");
        console.log('New viewer connected');
    }
    socket.on('connect', function(event) {
        socket.emit('asq:admin', {session:session});

        /**
          Handle socket event 'new'
          Notifies the admin of a new connection to the presentation.
         */
	socket.on('asq:submit', function(event) {
			console.log("You've got an answer!");
            updateParticipation(event.submitted, event.users);
        });

        /**
         * Update the viewers count when users connect or disconnect.
         */
        socket.on('asq:viewers-update', updateViewersCount);

        socket.on('asq:start', function(event) {
            if (!started) {
                impress().start();
                $('#welcomeScreen').modal('hide');
                started = true;
            }
        });

        socket.on('asq:goto', function(event) {
            impress().goto(event.slide);
        });

        socket.on('asq:question', function(event) {
            showQuestion(event.question);
        });

        socket.on('asq:answer', function(event) {
            showAnswer(event.question, event.stats); //Question contains the answer.
        });

        socket.on('asq:hide-answer', function(event) {
            $('#answer').modal('hide');
        });

    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:stepgoto", function(event) {
        socket.emit('asq:goto', {slide:event.target.id, session:session});
    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:start", function(event) {
        socket.emit('asq:start', {session:session, slide:$('#impress .active').attr('id')});
    });

    document.addEventListener('asq:close', function(event) {
        socket.emit('asq:goto', {session:session});
    });
    
    //Shows stasts/answers
     document.addEventListener('local:show-stats', function(event) {
        socket.emit('asq:show-stats', {});
    });
}

function updateParticipation(submitted, users){
	var maxUsers = -1;
	if(maxUsers < users){
		maxUsers = users;
	}
	if(maxUsers == submitted){
		$('#progressNum').text( 'All answers recived ('+ submitted + '/' + maxUsers + '). ');
		$('#show-stats').attr("class","btn btn-success");
	}else{
		$('#progressNum').text(submitted + '/' + maxUsers + ' answers recived.');
	}
	var width = (submitted/maxUsers)*100;
	$('#progessbar').css('width', width+"%");
}

var showStats=function() {
    var myEvent = new CustomEvent('local:show-stats', {});
    document.dispatchEvent(myEvent);
}


var showQuestion=function(question) {
	$('#progessbar').css('width',"0%");
	$('#progressNum').text('Waiting for answers!');
    $('#question').modal('show');
    $('#questionText').html('<h3>'+question.questionText+'</h3>');
    var optionsstring='';
    if (question.questionType=="Multiple choice") {
        optionsstring='<span class="help-block">Please select all correct answers.</span>';
        for (var i=0;i<question.answeroptions.length;i++) {
            optionsstring+='<label class="checkbox"><input type="checkbox">'+question.answeroptions[i].optionText+'</label>';
        }
        
    } else {
        optionsstring='<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
        optionsstring+='<input type="text" placeholder="Your solution...">';
    }
    
    
    $('#answeroptions').html(optionsstring);
			
}

var showAnswer=function(question, stats) {
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
       	if(question.questionType === "Multiple choice"){
        	var mscstatData = google.visualization.arrayToDataTable(countedMcOptions);
        }
        var rvswData  = google.visualization.arrayToDataTable(correct);
        var diffAnsData  = google.visualization.arrayToDataTable(equalAnswers);

        var rvswOpt = {
            title : 'Correct vs. Wrong',
            'width':760,
            'height':400,
            chartArea:{left:0,top:0,width:"600px",height:"350px"}
        };

        var mscstatOpt = {
            animation: {duration: 1000},
            hAxis: {allowContainerBoundaryTextCufoff: true, slantedTextAngle: 50},
            'width':760,
            
            'legend': {position: 'top', textStyle: { fontSize: 16}}
        };

        var chart3 = new google.visualization.PieChart(document.getElementById('rvswChart'));
        chart3.draw(rvswData, rvswOpt);
	
		if(question.questionType === "Multiple choice"){
        	var chart = new google.visualization.ColumnChart(document.getElementById('mscstatChart'));
        	chart.draw(mscstatData, mscstatOpt);
		}else{
			$('#mscstats').css("display", 'none');
			$('#mscstats').removeAttr('style');
			$('#mscstatsBtn').remove();
		}
        
        var chart = new google.visualization.ColumnChart(document.getElementById('diffAnsChart'));
        chart.draw(diffAnsData, mscstatOpt);
    }

    $('#answerText').html('<h3>Statistics for "'+question.questionText+'"</h3>');
    var optionsstring='<h5>Correct answer:</h5>';
    if (question.questionType=="Multiple choice") {
        for (var i=0;i<question.answeroptions.length;i++) {
            optionsstring+='<label class="checkbox" >';
            if (question.answeroptions[i].correct==true) {
                optionsstring+='<i class="icon-ok"> </i> ';
            } else {
                optionsstring+='<i class="icon-remove"> </i> ';
            }
            optionsstring+=question.answeroptions[i].optionText+'</label>';
        }
    } else {
        optionsstring='<span class="help-block">Correct answer.</span>';
        optionsstring+='<p>'+  +'</p>';
        optionsstring+='<span class="help-block">Your answer.</span>';
		optionsstring+='<input type="text" value="Norway" readonly>';
    }
    //google.setOnLoadCallback(drawChart);
    //drawChart();
    //update modal content
    $('#answersolutions').html(optionsstring);
    $('#question').modal('hide');
    $('#answer').modal('show');
};
