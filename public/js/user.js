var connect = function(host, port, session) {
	var started = false;
	console.log('http://' + host + ':' + port + '/ctrl' +" session:" + session);
	var socket = io.connect('http://' + host + ':' + port + '/ctrl');

	socket.on('connect', function(event) {
		socket.emit('asq:admin', {
			session : session
		});
		socket.on('asq:session-terminated', function(event) {
			console.log("Session terminated");
			$('.activeSessionAlert').remove();

		});
	});
	$('#stopSessionBtn').click(function() {
		socket.emit('asq:terminate-session', {
			session : session
		});
	});
}
