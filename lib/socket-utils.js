var when      = require("when")
, arrayEqual  = require('./utils').arrayEqual;


// returns date either by callback or promise
// copied from https://github.com/glennjones/microformat-node/
// full credit goes to Glenn Jones
// Reuse from ASQParser, should be put in utils!
var returnData = function(errors, data, callback, deferred) {
  if (callback && typeof(callback) == "function") {
    callback(errors, data);
  } else {
    if (errors) {
      deferred.reject(errors);
    } else {
      deferred.resolve(data);
    }
  }
}

/*
 *  Get the session from a socket.
 */
var getSession = function(io, socketId, callback) {
	var sid    = null
	, deferred = when.defer();

	for (var room in io.sockets.manager.roomClients[socketId]) {
		if (room.length > 6) { // Ugly hack, ugly hack, ugly hack...
			sid = room.slice(6); // Ugly hack again, ugly hack again, ugly hack again...
			break;
		}
  }

  if (!sid) {
		returnData(new Error("No session found for socket " + socketId), null, callback, deferred);
  } else {
		var Session = db.model('Session', schemas.sessionSchema);
		Session.findById(sid, function(err, session){
			if (err) {
				returnData(new Error("No session with id: " + sid + "found in db."), null, callback, deferred);
			} else {
				returnData(null, session, callback, deferred);
			}			
		});
	}
	return deferred.promise;
}

/*
 *  Get the dislayName stored with a socket.
 *  This function was rewritten to support a promise.
 */
var getDisplayName = function(socket, callback) {
	var deferred = when.defer();

	socket.get("displayName", function(err, name) {
		if (callback & (typeof(callback) == "function")) {
			callback(err, name);
		} else if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(name);
		}
	});

	return deferred.promise;
}


/*
 *  Emit an event to the ctrl, folo and wtap namespaces to go to a speciic slide.
 */
var goto = function(io, socket, event) {
	var sessionId     = undefined
   , currentSession = undefined;

	getSession(io, socket.id)
		.then(function(session){
			sessionId      = session._id;
			currentSession = session;
			return when.all([
				currentSession.questionsForSlide(event.slide),
      currentSession.statQuestionsForSlide(event.slide)
			]);
		}, function(err) {
			throw err;
		})
		.then(function(results) {
			var activeQuestions    =  results[0]
    , activeStatsQuestions = results[1];

      io.of("/ctrl").in(sessionId).emit('asq:goto', event);
      io.of("/folo").in(sessionId).emit('asq:goto', event);
      io.of("/wtap").in(sessionId).emit('asq:goto', event);
      
      currentSession.activeSlide = event.slide;
      currentSession.activeQuestions = results[0];
      currentSession.activeStatsQuestions = results[1];

      //TODO: Handle stats
      
			// if (activeStatsQuestions) {
			// 	for (var i=0; i < io.of('/folo').clients(sessionId).length; i++) {
			// 		io.of('/folo').clients(sessionId)[i].get('displayName',
			// 			function(err, name) {
			// 				if (!err && name) {
			// 					displayNames.push(name);
			// 					if  (i === io.of('/folo').clients(sessionId).length - 1) {
			// 						//send answers
			// 					}
			// 				}
			// 			})
			// 	}
			// }

      currentSession.save(function(err) {
				if (err) { throw err; }
      });

 		}, function(err) {
 			throw err;
 		})

}

var gotosub = function(io, socket, event) {
	getSession(io, socket.id, function(err, session){
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
	console.log('SUBMIT');
	var Question = db.model('Question', schemas.questionSchema);
	when.all([
		getSession(io, socket.id),                 //SessionId
		getDisplayName(socket),                    //Socket (user) name
		Question.findById(event.questionId).exec() //Question
	]).then(
		function(data) {
			var score = arrayEqual(event.answers, data[2].getSolution()) ? 100 : 0
			, Answer  = db.model('Answer', schemas.answerSchema);
			Answer.findOneAndUpdate({
				session  : data[0],    //SessionId
				answeree : data[1],    //Socket (user) name
				question : data[2]._id //_id attr. of question
			}, {
				submission  : event.answers,
				correctness : score
			}, { upsert : true //Create the answer if it does not exist (allow for resubmission) (needs to be changed for peer assessment)
			}, function(err, answer) {
					if (err) {
						console.log(err);
						throw err;
					}
					socket.emit('asq:submitted', { questionId : event.questionId });
					io.of("/ctrl").in(data[0]).emit('asq:submitted', { questionId : event.questionId });
				});
		},
		function(err) {
			console.log(err);
			throw err;
		});

}

var ioConnect = function(io, socket, namespace) {
	socket.join(socket.handshake.session._id);
	socket.emit('asq:goto', { slide: socket.handshake.session.activeSlide });
	io.of("/ctrl").in(socket.handshake.session._id).emit("asq:" + namespace + "-connected");
	io.of("/" + namespace).in(socket.handshake.session._id).emit("asq:" + namespace + "-connected");
}

var ctrlConnect = function(io, socket) {
	socket.set('displayName', socket.handshake.displayName);
	ioConnect(io, socket, "ctrl");
	io.of("/wtap").in(socket.handshake.session._id).emit("asq:ctrl-connected");

}

var ctrlDisconnect = function(io, socket) {
	console.log('CTRL Disconnect');
	when.all([
		getSession(io, socket.id),
		getDisplayName(socket)
	]).then(
	function(data) {
		var session     = data[0]
		,		displayName = data[1];

		socket.broadcast.to(session._id).emit('asq:ctrl-disconnected', { displayName : displayName });
		io.of("/folo").in(session._id).emit('asq:ctrl-disconnected', { displayName : displayName });
		io.of("/wtap").in(session._id).emit('asq:ctrl-disconnected', { displayName : displayName });
		delete socket;
		console.log('[CTRL] ' + displayName + " disconnected");

	}), function(err) {
		console.log('err');
		throw err;
	};
}

var foloConnect = function(io, socket) {
	socket.set('displayName', socket.handshake.displayName);
	ioConnect(io, socket, "folo");
	io.of("/wtap").in(socket.handshake.session._id).emit("asq:folo-connected");
}

var foloDisconnect = function(io, socket) {
	console.log('folo disc');
	when.all([
		getSession(io, socket.id),
		getDisplayName(socket)
	]).then(
	function(data) {
		var session     = data[0]
		,		displayName = data[1];
		socket.broadcast.to(session._id).emit('asq:folo-disconnected', { displayName : displayName });
		io.of("/ctrl").in(session._id).emit('asq:folo-disconnected', { displayName : displayName });
		io.of("/wtap").in(session._id).emit('asq:folo-disconnected', { displayName : displayName });
		delete socket;
		console.log('[FOLO] ' + displayName + " disconnected");

	}, function(err) {
		console.log('err');
		throw err;
	});
}

var wtapConnect = function(io, socket) {
	ioConnect(io, socket, "wtap");
}

var wtapDisconnect = function(io, socket) {
	socket.get('displayName', function(err, name) {
		if (err) { throw err; }
		io.of("/ctrl").in(sessionId).emit('asq:wtap-disconnected', {
			socket      : socket,
			displayName : name
		});
		delete socket;
	});
}

var statConnect = function(io, socket) {
	ioConnect(io, socket, "stat");
}

var statDisconnect = function(io, socket) {
	delete socket;
}

module.exports = {
	goto           : goto,
	gotosub        : gotosub,
	submit         : submit,
	ctrlConnect    : ctrlConnect,
	ctrlDisconnect : ctrlDisconnect,
	foloConnect    : foloConnect,
	foloDisconnect : foloDisconnect,
	wtapConnect    : wtapConnect,
	wtapDisconnect : wtapDisconnect,
	statConnect    : statConnect,
	statDisconnect : statDisconnect
}