var socketIo     = require('socket.io')
, lib 				   = require('./socket-utils')
, authentication = require('./authentication');



var init = function(server) {
	var io = socketIo.listen(server);

	io.configure('development', function() {
  	io.set('log level', 2);
  });

	io.of('/ctrl')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:goto', function(event){
				lib.goto(io, socket.id, event);
			});

			socket.on('asq:gotosub', function(event){
				lib.gotosub(io, socket.id, event);
			});

			socket.on('asq:stast', function(event){
				lib.stats(io, event);
			});

			socket.on('disconnect', function() {
				lib.ctrlDisconnect(io, socket);
			});
		});

	io.of('/folo')
		.authorization(authentication.liveAuthorize);
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:submit', function(event){
				lib.submit(io, event);
			});

			socket.on('disconnect', function() {
				lib.foloDisconnect(io, socket);
			});
		});

	io.of('/wtap')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			socket.on('disconnect', function() {
				lib.wtapDisconnect(io, socket);
			});
		});

	io.of('/stat')
		.authorization(authentication.ctrlAuthorize);
		.on('connection', function(socket) {
			//handle connection

			socket.on('disconnect', function() {
				lib.statDisconnect(io, socket);
			});
		});
}