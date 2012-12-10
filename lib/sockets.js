var socketio = require('socket.io')
  , passportSocketio = require('passport.socketio');

module.exports.listen = function(server) {
    var currentSlide = 0;
    var started = false;
    io = socketio.listen(server);
    var admin = io
    .of('/admin')
    /**.set('authorization', passportSocketio.authorize({
        sessionKey: '???',
        sessionStore: '???',
        sessionSecret: '???'}));

**/
    var viewers = io.of('/viewers');


    admin.on('connect', function(socket) {
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
    })
    // if authorization failed and cannot connect
    admin.on('connect_failed', function(reason) {
        console.log('Did not connect: ' + reason);
    });

    viewers.on('connect', function(socket) {
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