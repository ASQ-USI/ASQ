var socketIo       = require('socket.io');
var socketioJwt    = require("socketio-jwt");
var config         = require('../../config');
var logger         = require('logger-asq');
var authentication = require('./authentication');
var when           = require('when');
var nodefn         = require('when/node/function');
var redis          = require('node-redis');
var redisAdapter   = require('socket.io-redis');
var socketEmitter  = require('./pubsub');

/*
 *  Initialize the sockets server
 */
var listen = function(server) {
  logger.info('Starting socket server...');
  var io = socketIo(server /*, {"cookie": "asq.sid"}*/) //.listen(server);
  // redis
  var pub = redis.createClient(config.redis.port, config.redis.host)
    , sub = redis.createClient(config.redis.port, config.redis.host)
    , client = redis.createClient(config.redis.port, config.redis.host);

  io.adapter( redisAdapter({pubClient: pub, subClient: sub}) );  

  logger.info('Set sockets to use Redis as storage.');

  var utils = require('./utils')(io, client, socketEmitter);
  var handlers  = require('./handlers')(utils)

  io.of('/')
    .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.ownerAuthorize)
    .on('connection', function(socket) {
      socket.on('asq:update_presentation_settings', function(evt){
        handlers.updatePresentationSettings(socket, evt);
      });
    });
  
  /*
   *  Control the presentation and when to send the stats
   *  Requires to be granted control in the whitelist.
   */
  io.of('/ctrl')
    .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.ctrlAuthorize)
    .on('connection', function(socket) {
      /*
       *  Handle connection.
       */
      handlers.ctrlConnect(socket);

      /*
       *  Handle the request to go to a specific slide.
       */
      socket.on('asq:goto', function(evt){
        handlers.goto(socket, evt);
      });

      /*
       *  Handle the request to terminate the session.
       */
      socket.on('asq:terminate', function(evt){
        handlers.terminate(socket, evt);
      });

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        handlers.ctrlDisconnect(socket);
      });

      /*
       *  Get the statistics of a user for a give session.
       */
      socket.on('asq:get-user-session-stats', function(evt) {
        handlers.getUserSessionStats(socket, evt);
      });

      /*
       *  Get slideshow thumbnails
       */
      socket.on('/user/presentation/thumbnails', function(evt) {
        if(evt.method == 'GET'){

          require('../presentation/presentationThumbnails')
            .getThumbnails(evt.presentationId)
            .then(function(thumbs){
              socket.emit('/user/presentation/thumbnails', {thumbnails: thumbs})
            })
        }else if(evt.method == 'POST'){
          // TODO: check if socket user is the owner of the presentation
          require('../presentation/presentationThumbnails')
            .setThumbnails(evt.presentationId, evt.thumbnails)
        }
      });

      /*
       *  Get slideshow fontFaces
       */
      socket.on('/user/presentation/fontfaces', function(evt) {
        if(evt.method == 'GET'){
          
          require('../presentation/presentationThumbnails')
            .getFontFaces(evt.presentationId)
            .then(function(fontFaces){
              socket.emit('/user/presentation/fontfaces', {fontFaces: fontFaces})
            })
        }else if(evt.method == 'POST'){
          require('../presentation/presentationThumbnails')
            .setFontFaces(evt.presentationId, evt.fontFaces)
        }
      });
    });

  /*
   *  Gets updated with the curent state of the presentation.
   *  But cannot control it. Handles the submission to questions.
   */
  io.of('/folo')
    .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.liveAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      handlers.foloConnect(socket);

      /*
       *  Handle the request to go to a specific slide.
       */
      socket.on('asq:goto', function(evt){
        handlers.goto(socket, evt);
      });

      /*
       *  Handle a submission to a question.
       */
      socket.on('asq:submit', function(evt){
        handlers.submit(socket, evt);
      });

       /*
       *  Handle an exercise submission.
       */
      socket.on('asq:exerciseSubmission', function(evt){
        handlers.onExerciseSubmission(socket, evt);
      });

      /*
       *  Handle an assessment of an answer.
       */
      socket.on('asq:assess', function(evt){
        handlers.foloAssess(socket, evt);
      });

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        handlers.foloDisconnect(socket);
      });

       /*
       *  Change screename
       */
      socket.on('asq:change-screenname', function(evt) {
        handlers.foloChangeScreenName(socket, evt);
      });

      /*
       *  Get the statistics of a user for a give session.
       */
      socket.on('asq:get-user-session-stats', function(evt) {
        try{
          var data = {
            userId: socket.request.token,
            sessionId: socket.request.sessionId
          }
          handlers.getUserSessionStats(socket, data);
        }catch(err){
          logger.error(err.msg, { err: err});
        }
      });
    });

  /*
   *  Ghost of the presentation, similar to folo but
   *  does not allow to submit answers.
   *  Requires to be granted control in the whitelist.
   */
  io.of('/ghost')
   .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.liveAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      handlers.ghostConnect(socket);

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        handlers.ghostDisconnect(socket);
      });
    });

  /*
   *  Sends updates with the current stats.
   *  Requires to be granted control in the whitelist.
   */
  io.of('/stat')
    .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.ctrlAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      handlers.statConnect(socket);

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        handlers.statDisconnect(socket);
      });
    });

  return io;
}

module.exports = {
  listen : listen
}