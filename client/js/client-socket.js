'use strict';

var $ = require('jQuery')
	, io = require('socket.io-browserify');

var connect = function (host, port, session) {
	var started = false;
	var socket = io.connect('http://' + host + ':' + port + '/ctrl?sid=' + session);

	socket.on('connect', function(event) {
		socket.emit('asq:admin', {
			session : session
		});
		socket.on('asq:session-terminated', function(event) {
			$('.activeSessionAlert').remove();

		});
	});
	$('#stopSessionBtn').click(function() {
		socket.emit('asq:terminate-session', {
			session : session
		});
	});
}

var init = function init(){
	//On DOM ready connect
	// notice that the ASQ variables should be availabe in the global window object
	$(function(){ 
	  connect(ASQ.host , ASQ.port, ASQ.id);
	})
}

module.exports={
	init : init
}

