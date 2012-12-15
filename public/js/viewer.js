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
    
    document.addEventListener('asq:submit', function(event) {
        socket.emit('asq:submit', {session:session, answers:event.detail.answers, questionId:questionId});
    });
}




var showQuestion=function(question) {
    $('#question').modal('show');
    $('#questionText').html('<h3>'+question.questionText+'</h3>');
    var optionsstring='';
    if (question.questionType=="Multiple choice") {
        optionsstring='<span class="help-block">Please select all correct answers.</span>';
        for (var i=0;i<question.answeroptions.length;i++) {
            optionsstring+='<label class="checkbox"><input type="checkbox" id="checkbox'+i+'">'+question.answeroptions[i].optionText+'</label>';
        }
        
    } else {
        optionsstring='<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
        optionsstring+='<input type="text" id="textbox" placeholder="Your solution...">';
    }
    
    $('#answeroptions').html(optionsstring);
			
}

var showAnswer=function(question) {
    $('#question').modal('hide');
    $('#answer').modal('show');
    $('#answerText').html('<h3>Statistics for</h3><h4>"'+question.questionText+'"</h4>');
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
        optionsstring='<span class="help-block">Please enter your solution. Capitalisation will be ignored.</span>';
        optionsstring+='<input  type="text"  placeholder="Your solution...">';
    }
    
    $('#answersolutions').html(optionsstring);
};

var send=function() {
    var answers=[];
    for (var i=0;i<$('#answeroptions').children().size()-1;i++) {
        if ($('#textbox').length>0) {
            answers[i]=$('#textbox').val();
        } else {
            if ($('#checkbox'+i).is(':checked')){
            answers[i]=true;
        } else {
            answers[i]=false;
        }
        }
        
        
        console.log(answers);
    }
    var myEvent = new CustomEvent("asq:submit", {
        "detail": {
            "answers": answers
        }
    });
    document.dispatchEvent(myEvent);
}
