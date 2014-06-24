var socketIo     = require('socket.io')
  , config         = require('../config')
  , logger         = require('./logger').socLogger
  , authentication = require('./authentication')
  , when           = require('when')
  , nodefn         = require('when/node/function')
  , RedisStore     = require('socket.io/lib/stores/redis')
  , redis          = require('socket.io/node_modules/redis');

/*
 *  Initialize the sockets server
 */
var listen = function(server) {
  var io = socketIo.listen(server);
  var utils = null;

  //General configuration
  io.configure(function() {
    logger.info('Applying default config');
    io.set('logger', logger);
    io.set('log level', (
      function setLogLevel() {
        switch(config.log.sockets.level) {
          case 'error' :
            return 0;
          case 'warn' :
            return 1;
          case 'info' :
            return 2;
          case 'debug' :
            return 3;
        }
      })()
    );
    var pub = redis.createClient()
      , sub = redis.createClient()
      , client = redis.createClient();

    when.all([
      nodefn.call(pub.select.bind(pub), 1),
      nodefn.call(sub.select.bind(sub), 1),
      nodefn.call(client.select.bind(client), 1)
    ]).then(
    function setSocketStore() {
      io.set('store', new RedisStore({
        redis       : redis,
        redisPub    : pub,
        redisSub    : sub,
        redisClient : client
      }));
      logger.info('Set sockets to use Redis as storage.');
      utils = require('./utils').socket(io, client);
    }, function socketStoreErr(err) {
      logger.error('Failed to set the socket store with Redis:\n\t'
        + err.toString());
    });

  });

  //Production specific configuration
  io.configure('production', function() {
    logger.info('Applying production config');
    io.enable('browser client minification');  // send minified client
    io.enable('browser client etag');          // apply etag caching logic
    io.enable('browser client gzip');          // gzip the file
  });

  /*
   *  Control the presentation and when to send the stats
   *  Requires to be granted control in the whitelist.
   */
  io.of('/ctrl')
    .authorization(authentication.ctrlAuthorize)
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
    .authorization(authentication.liveAuthorize)
    .on('connection', function(socket) {
      /** handle connection **/
      utils.foloConnect(socket);

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
    .authorization(authentication.ctrlAuthorize)
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
    .authorization(authentication.ctrlAuthorize)
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