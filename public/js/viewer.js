/**
    @fileoverview Socket code for the viewer client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

// Save current question id;
var questionId = null;

/** Connect back to the server with a websocket */
var connect = function(host, port, session) {
    var started = false;
    var socket = io.connect('http://' + host + ':' + port + '/folo');
    socket.on('connect', function(event) {
        socket.emit('asq:viewer', {session:session});

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
        });
    });
    
    document.addEventListener('local:submit', function(event) {
        socket.emit('asq:submit', {session:session, answers:event.detail.answers, questionId:questionId});
    });
}




var showQuestion=function(question) {
	$('#blockOptions').css("display", "none");
	$('#changeAnswer').css("display", "none");
	$('#sendanswers').removeAttr("disabled");
	
    
    $('#questionText').html('<h3>'+question.questionText+'</h3><button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>');
    var optionsstring='';
    if (question.questionType === "Multiple choice") {
        optionsstring='<span class="help-block">Please select all correct answers.</span>';
        for (var i=0;i<question.answeroptions.length;i++) {
            optionsstring+='<label class="checkbox"><input type="checkbox" id="checkbox'+i+'">'+question.answeroptions[i].optionText+'</label>';
        }
        
    } else {
        optionsstring='<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
        optionsstring+='<input type="text" id="textbox" placeholder="Your solution...">';
    }
    
    $('#answeroptions').html(optionsstring);
    $('#question').modal('show');
}

var showAnswer=function(question) {
    $('#question').modal('hide');
    $('#answerText').html('<h3>Statistics for</h3><h4>"' 
    		+ question.questionText 
    		+ '"</h4> <button type="button" class="close" data-dismiss="modal" aria-hidden="true">X</button>');
    		
    var optionsstring='';
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
        optionsstring+='<span class="help-block">Correct answer.</span>';
        optionsstring+='<p>'+ A +'</p>';
        optionsstring+='<span class="help-block">Your answer.</span>';
		optionsstring+='<input type="text" value="Norway" readonly>';
    }
    
    $('#answersolutions').html(optionsstring);
    $('#answer').modal('show');
};

var send=function() {
	var answers = [];
	for (var i = 0; i < $('#answeroptions').children().size() - 1; i++) {
		if ($('#textbox').length > 0) {
			answers[i] = $('#textbox').val();
		} else {
			if ($('#checkbox' + i).is(':checked')) {
				answers[i] = true;
			} else {
				answers[i] = false;
			}
		}

	}
	var myEvent = new CustomEvent("local:submit", {
		"detail" : {
			"answers" : answers
		}
	});
	document.dispatchEvent(myEvent); 
	
	$('#blockOptions').css("display", "block");
	$('#changeAnswer').removeAttr("style");
	$('#sendanswers').attr("disabled", "disabled");
}

var changeAnswer = function(){
	$('#blockOptions').css("display", "none");
	$('#changeAnswer').css("display", "none");
	$('#sendanswers').removeAttr("disabled");
}
