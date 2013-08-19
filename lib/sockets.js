var socketIo     = require('socket.io')
, lib 				   = require('./socket-utils')
, config 				 = require('../config')
, logger 				 = require('./logger').socLogger
, authentication = require('./authentication');

/*
 *  Initialize the sockets server
 */
var listen = function(server) {
	var io = socketIo.listen(server);

	io.configure('development', function() {
		io.set('logger', logger)
  	io.set('log level', (
  		function setLogLevel() {
	  		switch(logger.level) {
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
			socket.on('asq:goto', function(event){
				lib.goto(io, socket, event);
			});

			/*
			 *  Handle the request to go to a specific element in a slide.
			 */
			socket.on('asq:gotosub', function(event){
				lib.gotosub(io, socket, event);
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
			socket.on('asq:submit', function(event){
				lib.submit(io, socket, event);
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