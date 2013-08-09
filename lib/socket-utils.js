var when = require("when");

// returns date either by callback or promise
// copied from https://github.com/glennjones/microformat-node/
// full credit goes to Glenn Jones
// Reuse from ASQParser, should be put in utils!
function returnData(errors, data, callback, deferred, logger){
  //TODO handle logger
  if(errors){
   logger.error(JSON.stringify(errors));
  }
  if(callback && (typeof(callback) == "function")){
    callback(errors, data);
  }else{
    if(errors){
      deferred.reject(errors);
    }else{
      deferred.resolve(data);
    }
  }
}

var getSession = function(io, socketId, callback) {
	var sid    = null
	, deferred = when.defer();

	for (room in io.sockets.manager.roomClients[socketId]) {
		if (room.length > 6) { // Ugly hack, ugly hack, ugly hack...
			sid = room.slice(6); // Ugly hack again, ugly hack again, ugly hack again...
			break;
		}
  }

  if (!sid) {
  	returnData("No session found for socket " + socketId, null, callback, deferred);
  } else {

	  Session.findByID(sid, function(err, session){
	  	if (err) {
	  		returnData("No session with id: " + sid + "found in db.", null, callback, deferred);
	  	} else {
	  		returnData(null, session, callback);
	  	}
	  	
	  });
	}

return deferred.promise;

}


/*
 *  Emit an event to the ctrl, folo and wtap namespaces to go to a speciic slide.
 */
var goto = function(io, socket, event) {
	var sessionId     = getSession(socketId)
   , currentSession = undefined;

 	getSession(io, socket)
 		.then(function(err, session){
 			if (err) { throw err; }
 			currentSession = session;
 			return when.all([
 				currentSession.questionsForSlide(event.slide),
        currentSession.statQuestionsForSlide(event.slide)
 			]);
 		})

 		.then(function(resluts) {
 			var activeQuestions    =  results[0]
      , activeStatsQuestions = results[1];

      io.of("/ctrl").in(sessionId).emit('asq:goto', event);
      io.of("/folo").in(sessionId).emit('asq:goto', event);
      io.of("/wtap").in(sessionId).emit('asq:goto', event);

      
      currentSession.activeSlide = event.slide;
      currentSession.activeQuestions = results[0];
      currentSession.activeStatsQuestions = results[1];

      //TODO: Handle stats
      
      if (activeStatsQuestions) {
      	for (var i=0; i < io.of('/folo').clients(sessionId).length; i++) {
      		io.of('/folo').clients(sessionId)[i].get('displayName',
      			function(err, name) {
      				if (!err && name) {
      					displayNames.push(name);
      					if  (i === io.of('/folo').clients(sessionId).length - 1) {
      						//send answers
      					}
      				}
      			})
      	}
      }

      currentSession.save(function(err) {
            if (err) { throw err; }
          });
 		})

}

var gotosub = function(io, socket, event) {
	getSession(io, socketId, function(err, session){
			if (err) { throw err; }

			io.of("/ctrl").in(sessionId).emit('asq:gotosub', event);
      io.of("/folo").in(sessionId).emit('asq:gotosub', event);
      io.of("/wtap").in(sessionId).emit('asq:gotosub', event);

      session.activeSubstep = event.substepIndex;
        session.save(function(err) {
            if (err) { throw err; }
        });
		});

}

var submit = function(io, socket, event) {

}

var ctrlDisconnect = function(io, socket) {
	socket.get('displayName', function(err, name) {
		if (err) { throw err; }
		socket.broadcast.to(sessionId).emit('asq:ctrlDisconnected', {
			socket      : socket,
			displayName : name
		});
		io.of("/folo").in(sessionId).emit('asq:ctrlDisconnected', {
			socket      : socket,
			displayName : name
		});
		io.of("/wtap").in(sessionId).emit('asq:ctrlDisconnected', {
			socket      : socket,
			displayName : name
		});
		delete socket;
	});
	

}

var foloDisconnect = function(io, socket) {
	socket.get('displayName', function(err, name) {
		if (err) { throw err; }
		socket.broadcast.to(sessionId).emit('asq:foloDisconnected', {
			socket      : socket,
			displayName : name
		});
		io.of("/ctrl").in(sessionId).emit('asq:foloDisconnected', {
			socket      : socket,
			displayName : name
		});
		io.of("/wtap").in(sessionId).emit('asq:foloDisconnected', {
			socket      : socket,
			displayName : name
		});
		delete socket;
}

var wtapDisconnect = function(io, socket) {
	socket.get('displayName', function(err, name) {
		if (err) { throw err; }
		io.of("/ctrl").in(sessionId).emit('asq:wtapDisconnected', {
			socket      : socket,
			displayName : name
		});
		delete socket;
	}
}

var statDisconnect = function(io, socket) {
	delete socket;
}

module.exports = {
	goto           : goto,
	gotosub        : gotosub,
	stats          : stats,
	submit         : submit,
	ctrlDisconnect : ctrlDisconnect,
	foloDisconnect : foloDisconnect,
	wtapDisconnect : wtapDisconnect,
	statDisconnect : statDisconnect
}