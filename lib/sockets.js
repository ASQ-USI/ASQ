var socketio = require('socket.io');

module.exports.listen = function(server) {
    var currentSlide = 0;
    var started = false;
    io = socketio.listen(server);
    io.sockets.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('viewer', function(event) {
            socket.join('viewers');
            if (started) {
                socket.emit('impress:start', {});
            }
            socket.emit('goto', {slide:currentSlide});
            io.sockets.in('admins').emit('new', {});
        });
        /** @function Handle connection from admin. */
        socket.on('admin', function(event) {
            socket.join('admins');
        });

        /**
           @ function Handle goto event.
           When a goto event from an admin is sent, update status of current slide
           and informs all viewers of the new current slide
           @todo Implement authentification to make sure the event comes from a
           valid admin.
         */
        socket.on('goto', function(event) {
            currentSlide = event.slide;
            io.sockets.in('viewers').emit('goto', event);
        });

        socket.on('impress:start', function(event) {
            started = true;
            io.sockets.in('viewers').emit('impress:start', event);
        });
    });
    return io;
}