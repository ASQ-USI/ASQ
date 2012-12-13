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
                console.log('started');
                impress().start();
                $('#welcomeScreen').modal('hide');
                started = true;
            }
        });

        socket.on('asq:goto', function(event) {
            console.log('received goto');
            impress().goto(event.slide);
        });

        socket.on('asq:question', function(event) {
            showQuestion(event.question);
        });

        socket.on('asq:answer', function(event) {
            showAnswer(event.answer);
        });

        socket.on('asq:hide-answer', function(event) {
            $('#popAnswer').modal('hide');
        });

    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:stepgoto", function(event) {
        console.log('emitting goto');
        socket.emit('asq:goto', {slide:event.target.id, session:session});
    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:start", function(event) {
        console.log('going to ' + event.target.id);
        socket.emit('asq:start', {session:session});
    });

    document.addEventListener('asq:answer', function(event) {
        socket.emit('asq:show-answer', {session:session});
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

