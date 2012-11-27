/**
    @fileoverview Socket code for the viewer client.
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

/** Connect back to the server with a websocket */
var connect = function() {
    var socket = io.connect("http://10.61.105.11:3000");
    socket.on('connect', function(event) {
        socket.emit('viewer', {});

        /**
          Handle socket event 'goto'
          Uses impress.js API to go to the specified slide in the event.
         */
        socket.on('goto', function(event) {
            impress().goto(event.slide);
        });
    });
}
