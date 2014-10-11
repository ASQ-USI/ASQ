var socketIo      = require('socket.io')
  , socketioJwt   = require("socketio-jwt")
  , config         = require('../config')
  , logger         = require('./logger').socLogger
  , authentication = require('./authentication')
  , when           = require('when')
  , nodefn         = require('when/node/function')
  , redis          = require('node-redis')
  , redisAdapter          = require('socket.io-redis');

/*
 *  Initialize the sockets server
 */
var listen = function(server) {
  logger.info('Startin socket server...');
  var io = socketIo(server /*, {"cookie": "asq.sid"}*/) //.listen(server);
  // redis
  var pub = redis.createClient()
    , sub = redis.createClient()
    , client = redis.createClient();

  io.adapter( redisAdapter({pubClient: pub, subClient: sub}) );

  logger.info('Set sockets to use Redis as storage.');

  var utils = null;
  var utils = require('./utils').socket(io,client);

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
      /** handle connection **/
      utils.ctrlConnect(socket);

      /*
       *  Handle the request to go to a specific slide.
       */
      socket.on('asq:goto', function(evt){
        utils.goto(socket, evt);
      });

      /*
       *  Handle the request to go to a specific element in a slide.
       */
      socket.on('asq:gotosub', function(evt){
        utils.gotosub(socket, evt);
      });

      /*
       *  Handle the request to terminate the session.
       */
      socket.on('asq:terminate', function(evt){
        utils.terminate(socket, evt);
      });

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        utils.ctrlDisconnect(socket);
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
      utils.foloConnect(socket);

      /*
       *  Handle a submission to a question.
       */
      socket.on('asq:goto', function(evt){
        utils.goto(socket, evt);
      });

      /*
       *  Handle a submission to a question.
       */
      socket.on('asq:submit', function(evt){
        utils.submit(socket, evt);
      });

      /*
       *  Handle an assessment of an answer.
       */
      socket.on('asq:assess', function(evt){
        utils.foloAssess(socket, evt);
      });

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        utils.foloDisconnect(socket);
      });
    });

  /*
   *  Wiretap of the presentation, similar to folo but
   *  does not allow to submit answers.
   *  Requires to be granted control in the whitelist.
   */
  io.of('/wtap')
   // .authorization(authentication.ctrlAuthorize)
   .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.ctrlAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      utils.wtapConnect(socket);

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        utils.wtapDisconnect(socket);
      });
    });

  /*
   *  Sends updates with the current stats.
   *  Requires to be granted control in the whitelist.
   */
  io.of('/stat')
    //.authorization(authentication.ctrlAuthorize)
    .use(socketioJwt.authorize({
      secret: 'The secret about ASQ is that it is cool',
      handshake: true
    }))
    .use(authentication.ctrlAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      utils.statConnect(socket);

      /*
       *  Handle the disconnection of a socket from the namespace.
       */
      socket.on('disconnect', function() {
        utils.statDisconnect(socket);
      });
    });

  return io;
}

module.exports = {
  listen : listen
}