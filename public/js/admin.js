/**
    @fileoverview Socket code for the admin client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

/** Connect back to the server with a websocket */
var connect = function(host, port, session) {
    var started = false;
    var socket = io.connect('http://' + host + ':' + port + '/ctrl');
    socket.on('connect', function(event) {
        socket.emit('asq:admin', {session:session});

        /**
          Handle socket event 'new'
          Notifies the admin of a new connection to the presentation.
         */
        socket.on('asq:new-viewer', function(event){
            console.log('New viewer connected');
        });

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
        socket.emit('asq:start', {session:session, slide:document.querySelector(".active").id});
    });

    document.addEventListener('asq:close', function(event) {
        socket.emit('asq:goto', {session:session});
    });
}

var showQuestion=function(question) {
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
    google.load("visualization", "1", {
        packages : ["corechart"],
        callback : drawChart
    });

    //Google chart drawing for stats
    function drawChart() {
        console.log('GOOGLE CHART');
        var data = google.visualization.arrayToDataTable(countedMcOptions);
        var q1correct = google.visualization.arrayToDataTable(correct);
        console.log(data);

        var options3 = {
            title : 'Correct vs. Wrong',
            'width':760,
            'height':300,
        };

        var options2 = {
            animation: {duration: 1000},
            hAxis: {allowContainerBoundaryTextCufoff: true, slantedTextAngle: 50},
            'width':760,
            'height':300,
            'legend': {position: 'top', textStyle: { fontSize: 16}}
        };

        var chart3 = new google.visualization.PieChart(document.getElementById('Q1Correct'));
        chart3.draw(q1correct, options3);

        var chart = new google.visualization.ColumnChart(document.getElementById('q'));
        chart.draw(data, options2);
    }

    $('#answerText').html('<h3>Statistics for</h3><h4>"'+question.questionText+'"</h4>');
    var optionsstring='';
    if (question.questionType=="Multiple choice") {
        console.log(question);
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
        optionsstring='<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
        optionsstring+='<input type="text" placeholder="Your solution...">';
    }

    var correct = stats.correct || null;
    var countedMcOptions = stats.countedMcOptions || null;
    //google.setOnLoadCallback(drawChart);
    //drawChart();
    //update modal content
    //random comment
    $('#answersolutions').html(optionsstring);
    $('#question').modal('hide');
    $('#answer').modal('show');
};
