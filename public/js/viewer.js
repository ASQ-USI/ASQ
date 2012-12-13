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
            showAnswer(event.answer);
        });

        socket.on('asq:hide-answer', function(event) {
            $('#popAnswer').modal('hide');
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
        console.log("SUBMIT");
        //socket.emit('asq:submit', {session:session, data: event.data});
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
