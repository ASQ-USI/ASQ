var connect = function() {
    var socket = io.connect("http://10.20.6.135:3000");
    socket.on('connect', function(event) {
        socket.emit('viewer', {});

        socket.on('goto', function(event) {
            impress().goto(event.slide);
        });
    });
}
