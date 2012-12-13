/**
    @fileoverview Socket code for the admin client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

/** Connect back to the server with a websocket */
var connect = function(host, port, session) {
    var started = false;
    var socket = io.connect('http://' + host + ':' + port + '/ctrl');
    socket.on('connect', function(event) {
        socket.emit('admin', {session:session});

        /**
          Handle socket event 'new'
          Notifies the admin of a new connection to the presentation.
         */
        socket.on('new', function(event){
            console.log('New viewer connected');
        });

        socket.on('impress:start', function(event) {
            if (!started) {
                console.log('started');
                $('#welcomeScreen').modal('hide');
                started = true;
            }
        });

        socket.on('goto', function(event, question) {
            showQuestion(question);
            impress().goto(event.slide);
        });

        socket.on('question', function(event) {
            showQuestion(event.question);
        });

        socket.on('answer', function(event) {
            showAnswer(event.answer);
        });

        socket.on('hide', function(event) {
            $('#popAnswer').modal('hide');
        });

    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:stepgoto", function(event) {
        socket.emit('goto', {slide:event.target.id, session:session});
    });

    /**
      Handle impress:stepgoto event
      sSend a socket event to notify which slide to go to.
     */
    document.addEventListener("impress:start", function(event) {
        console.log('going to ' + event.target.id);
        socket.emit('impress:start', {session:session});
    });

    document.addEventListener('asq:answer', function(event) {
        socket.emit('show:answer', {session:session});
    });

    document.addEventListener('asq:close', function(event) {
        socket.emit('goto', {session:session});
    });


}

var showQuestion=function(question) {
    $('#quest').modal('show');
    $('#questionText').html('<h3>'+question.questionText+'</h3>');
    
}
