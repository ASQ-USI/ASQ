var connect = function() {
    var socket = io.connect("http://localhost:3000");
    socket.on('connect', function(event) {
        socket.emit('admin', {});

        socket.on('goto', function(event) {
            impress().goto(event.slide);
        });

        socket.on('new', function(event){
            console.log('New viewer connected');
        });
    });

    document.addEventListener("impress:stepgoto", function(event) {
        console.log('going to ' + event.target.id);
        socket.emit('goto', {slide:event.target.id});
    });
}
