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
            console.log('received goto');
            console.log(event.slide);
            impress().goto(event.slide);
        });

        socket.on('asq:question', function(event) {
            showQuestion(event.question);
        });

        socket.on('asq:answer', function(event) {
            showAnswer(event.question); //Question contains the answer.
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

showQuestion = function(question){
    console.log('showing question');
    console.log(question);
}

showAnswer = function(question) { //Questions contains the answer.
    console.log('showing answer');
    console.log(question);
}
