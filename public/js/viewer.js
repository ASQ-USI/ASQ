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
        socket.emit('viewer', {session:session});

        socket.on('impress:start', function(event) {
            if (!started) {
                $('#welcomeScreen').modal('hide');
                started = true;
            }
        });

        socket.on('question', function(event) {
            questionId = event.question._id;
            showQuestion(event.question);
        });

        socket.on('answer', function(event) {
            showAnswer(event.answer);
        });

        socket.on('hide', function(event) {
            $('#popAnswer').modal('hide');
        });

        /**
          Handle socket event 'goto'
          Uses impress.js API to go to the specified slide in the event.
         */
        socket.on('goto', function(event) {
            impress().goto(event.slide);
        });
    });

    document.addEventListener('asq:submit', function(event) {
        socket.emit('submit', {session:session, data: event.data});
    });
}
