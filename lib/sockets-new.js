var  socketIo = require('socket.io')
, lib 				= require('./socket-utils');



var init = function(server) {
	var io = socketIo.listen(server);

	io.configure('development', function() {
  	io.set('log level', 2);
  });

	io.of('/ctrl')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:goto', function(event){});
			socket.on('asq:gotosub', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/folo')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:submit', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/wtap')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/stat')
		.on('connection', function(socket) {
			//handle connection

			socket.on('disconnect', function() {});
		});

}