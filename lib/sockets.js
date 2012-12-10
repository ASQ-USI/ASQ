var socketio = require('socket.io')
  , passportSocketio = require('passport.socketio')
  , schemas = require('../models/models.js');

module.exports.listen = function(server) {
    var Session = db.model('Session', schemas.sessionSchema);
    var currentSlide = 0;
    var started = false;
    io = socketio.listen(server);
    var ctrl = io
    .of('/ctrl')
    /*.authorization(passportSocketio.authorize({
        sessionKey: '???',
        sessionStore: '???',
        sessionSecret: '???'}
    ));*/

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
            ctrl.in(event.session).emit('goto', event);
            folo.in(event.session).emit('goto', event);
            currentSlide = event.slide;
        });

        socket.on('impress:start', function(event) {
            started = true;
            ctrl.in(event.session).emit('impress:start', event);
            folo.in(event.session).emit('impress:start', event);
        });
    });

    folo.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('viewer', function(event) {
            socket.join(event.session);
            if (started) { //query database
                socket.emit('impress:start', {});
            }
            socket.emit('goto', {slide:currentSlide});
            ctrl.in(event.session).emit('new', {});
        });
    });
    return io;
}