var socketIo     = require('socket.io')
, lib 				   = require('./socket-utils')
, config 				 = require('../config')
, logger 				 = require('./logger').socLogger
, authentication = require('./authentication')
, when 					 = require('when')
, nodefn 		 = require('when/node/function')
, RedisStore     = require('socket.io/lib/stores/redis')
, redis 	 			 = require('socket.io/node_modules/redis');

/*
 *  Initialize the sockets server
 */
var listen = function(server) {
	var io = socketIo.listen(server);

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
  	var pub = redis.createClient();
  	var sub = redis.createClient();
  	var client = redis.createClient();
  	when.all([
  		//This is not working for some reason...
  		nodefn.apply(pub.select, 1),
  		nodefn.apply(sub.select, 1),
  		nodefn.apply(client.select, 1)
  	]).then(
  	function setSocketStore() {
  		io.set('store', new RedisStore({
  			redis       : redis,
	  		redisPub    : pub,
	  		redisSub    : sub,
	  		redisClient : client
  		}));
  		logger.info('Set sockets to use Redis as storage.');
  	}, function socketStoreerr(err) {
  		logger.error('Failded to set the socket store with Redis:\n\t'
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
			lib.ctrlConnect(io, socket);

			/*
			 *  Handle the request to go to a specific slide.
			 */
			socket.on('asq:goto', function(evt){
				lib.goto(io, socket, evt);
			});

			/*
			 *  Handle the request to go to a specific element in a slide.
			 */
			socket.on('asq:gotosub', function(evt){
				lib.gotosub(io, socket, evt);
			});

			/*
			 *  Handle the request to terminate the session.
			 */
			socket.on('asq:terminate', function(evt){
				lib.terminate(io, socket, evt);
			});


			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.ctrlDisconnect(io, socket);
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
			lib.foloConnect(io, socket);

			/*
			 *  Handle a submission to a question.
			 */
			socket.on('asq:submit', function(evt){
				lib.submit(io, socket, evt);
			});

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.foloDisconnect(io, socket);
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
			lib.wtapConnect(io, socket);

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.wtapDisconnect(io, socket);
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
			lib.statConnect(io, socket);

			/*
			 *  Handle the disconnection of a socket from the namespace.
			 */
			socket.on('disconnect', function() {
				lib.statDisconnect(io, socket);
			});
		});

	return io;
}

module.exports = {
	listen : listen
}