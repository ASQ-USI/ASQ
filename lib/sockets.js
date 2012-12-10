var socketio = require('socket.io')
  , passportSocketio = require('passport.socketio');

module.exports.listen = function(server) {
    var currentSlide = 0;
    var started = false;
    io = socketio.listen(server);
    var ctrl = io
    .of('/ctrl')
    .authorization(passportSocketio.authorize({
        sessionKey: '???',
        sessionStore: '???',
        sessionSecret: '???'}
    ));

    var folo = io.of('/folo');


    ctrl.on('connection', function(socket) {
        /** @function Handle connection from admin. */
        socket.on('admin', function(event) {
            socket.join(event.session);
        });

        /**
           @ function Handle goto event.
           When a goto event from an admin is sent, update status of current slide
           and informs all viewers of the new current slide
           @todo Implement authentification to make sure the event comes from a
           valid admin.
         */
        socket.on('goto', function(event) {
            admins.in(event.session).emit('goto', event);
            viewers.in(event.session).emit('goto', event);
            currentSlide = event.slide;
        });
    });

    viewers.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('viewer', function(event) {
            socket.join(event.session);
            if (started) { //query database
                socket.emit('impress:start', {});
            }
            socket.emit('goto', {slide:currentSlide});
            admins.in(event.session).emit('new', {});
        });

        socket.on('impress:start', function(event) {
            started = true;
            io.sockets.in('viewers').emit('impress:start', event);
        });
    });
    return io;
}