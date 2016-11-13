const socketIo = require('socket.io');
const Promise = require('bluebird');
const logger = require('logger-asq');
const passportSocketIo = require('passport.socketio');

const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
const redisAdapter = require('socket.io-redis');

const config = require('../../config');
const authentication = require('./authentication');

const socketEmitter = require('./pubsub');
const api = require('./api');
const leSecret = 'The secret about ASQ is that it is cool';

const expressSessionStore = require('../middleware/redisSessionStore');
const liveApp = require('./liveApp.js');
/*
 *  Initialize the sockets server
 */
const listen = function(server) {
  logger.info('Starting socket server...');
  const io = socketIo(server /*, {'cookie': 'asq.sid'}*/) //.listen(server);
  // redis
  // TODO: (triglian) remove `return_buffers: true` when the problem in 
  // https://github.com/socketio/socket.io-redis/issues/17 is fixed
  const pub = redis.createClient(config.redis.port, config.redis.host, {
    return_buffers: true
  });
  const sub = redis.createClient(config.redis.port, config.redis.host, {
    return_buffers: true
  });
  const client = redis.createClient(config.redis.port, config.redis.host, {
    return_buffers: true
  });

  io.adapter( redisAdapter({pubClient: pub, subClient: sub}) );  

  logger.info('Set sockets to use Redis as storage.');

  const utils = require('./utils')(io, client, socketEmitter);
  const handlers  = require('./handlers')(utils)
  const presenterHandlers  = require('./presenterHandlers')(utils)

  pSIoOpts = {
    key:          'asq.sid',
    secret:       'ASQSecret',
    store:        expressSessionStore,
    success:      onAuthorizeSuccess,
    fail:         onAuthorizeFail,
  }

  function onAuthorizeSuccess(data, accept){
    accept();
  }

  function onAuthorizeFail(data, message, error, accept){
    // If the authorization fails with no errors, it simple means
    // that the user is not authenticated. Depending on the namespace
    // we may still want to accept the user. That's why we only decline
    // when there's an actual error (and it's not passport related). 
    if(error && message !== 'Passport was not initialized'){
      accept(new Error(message));
    }else {
      accept();
    }
  }

  io.of('/')
    .use(passportSocketIo.authorize(pSIoOpts))
    .use(authentication.persistAuthenticatedUserToRedis(utils))
    .on('connection', function(socket) {
      // will store requestIds here:
      socket.requestIds = Object.create(null)
      socket.on('message', api.handleRequest.bind(api, socket));

      socket.on('asq:update_presentation_settings', function(evt){
        handlers.updatePresentationSettings(socket, evt);
      });
    });
  
  /*
   *  Control the presentation and when to send the stats
   *  Requires to be granted control in the whitelist.
   */
  io.of('/ctrl')
    .use(passportSocketIo.authorize(pSIoOpts))
    .use(authentication.ctrlAuthorize)
    .on('connection', function(socket) {
      /*
       *  Handle connection.
       */
      handlers.ctrlConnect(socket);

      socket.on('message', presenterHandlers.handleRequest.bind(presenterHandlers, socket));

      /*
       *  Handle the request to go to a specific slide.
       */
      socket.on('asq:goto', function(evt){
        handlers.goto(socket, evt);
      });

      /*
       *  Handle the request to terminate the session.
       */
      socket.on('asq:terminate-session', function(evt){
        handlers.terminateSession(socket, evt);
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
       *  asqplugin
       */
      socket.on('asq-plugin', function(evt) {
        handlers.ctrlAsqPlugin(socket, evt);
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
    .use(passportSocketIo.authorize(pSIoOpts))
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
       *  Change screenname
       */
      socket.on('asq:change-screenname', function(evt) {
        handlers.foloChangeScreenName(socket, evt);
      });

      /*
       *  ASQ snitch
       */
      socket.on('asq:snitch', function(evt) {
        handlers.foloSnitch(socket, evt);
      });

      /*
       *  Get the statistics of a user for a give session.
       */
      socket.on('asq:get-user-session-stats', function(evt) {
        try{
          const data = {
            userId: socket.request.token,
            sessionId: socket.request.sessionId
          }
          handlers.getUserSessionStats(socket, data);
        }catch(err){
          logger.error(err.msg, { err: err});
        }
      });

      /*
       *  Handle a toolbar Change.
       */
      socket.on('liveApp', function(evt){
            liveApp.handleSocketEvent(socket, evt);
        });
    });

  /*
   *  Ghost of the presentation, similar to folo but
   *  does not allow to submit answers.
   *  Requires to be granted control in the whitelist.
   */
  io.of('/ghost')
    .use(passportSocketIo.authorize(pSIoOpts))
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
