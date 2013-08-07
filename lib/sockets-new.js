var  socketIo = require.('socket.io');



var init = function(server) {
	var io = socketIo.listen(server);

	io.of('/ctrl')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:new-ctrl', function(event){});
			socket.on('asq:new-folo', function(event){});
			socket.on('asq:new-wtap', function(event){});
			socket.on('asq:new-stat', function(event){});
			socket.on('asq:goto', function(event){});
			socket.on('asq:gotosub', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/folo')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:new-ctrl', function(event){});
			socket.on('asq:new-folo', function(event){});
			socket.on('asq:goto', function(event){});
			socket.on('asq:gotosub', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/wtap')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:new-ctrl', function(event){});
			socket.on('asq:new-folo', function(event){});
			socket.on('asq:goto', function(event){});
			socket.on('asq:gotosub', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

	io.of('/stat')
		.on('connection', function(socket) {
			//handle connection

			socket.on('asq:new-ctrl', function(event){});
			socket.on('asq:new-folo', function(event){});
			socket.on('asq:stats', function(event){});
			socket.on('asq:terminated', function(event){});

			socket.on('disconnect', function() {});
		});

}