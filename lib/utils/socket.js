/** @module lib/socket
    @description socket utilities
*/

var when      = require("when")
, arrayEqual  = require('./stats').arrayEqual
, logger 			= require('../logger').socLogger;


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

var getSessionId = function(socket, callback) {
	var deferred = when.defer();

	socket.get('sessionId', function(err, sid) {
		if (callback && typeof(callback) === 'function') {
			callback(err, sid);
		} else if (err) {
			deferred.reject(err);
		} else {
			deferred.resolve(sid);
		}
	})
	return deferred.promise;
}

/*
 *  Get the session from a socket.
 */
var getSession = function(io, socket, callback) {
	var deferred = when.defer();

	getSessionId(socket).then(
		function retrieveSession(sid) { 
			return Session.findById(sid).exec();
		}).then(
		function returnSession(session) {
			if (callback && typeof(callback) === 'function') {
				return callback(null,  session);
			} else {
				deferred.resolve(session);
			}
		}, function onError(err) {
			logger.error('Error on retrieving session:\n\t' + err.toString());
			if (callback && typeof(callback) === 'function') {
				return (err, null);
			} else {
				deferred.reject(err);
			}
		});

	return deferred.promise;
}

var notifyNamespaces = function(eventName, evt, io, sessionId, namespaces) {
	if (arguments.length < 5) {
		return;
	}

	var args = Array.prototype.slice.call(arguments, 4);
	for (var i=0; i<args.length; i++) {
		io.of('/' + args[i]).in(sessionId).emit(eventName, evt);
	}
}

/*
 *  Emit an event to the ctrl, folo & wtap namespaces to go to a specific slide.
 */
var goto = function(io, socket, evt) {
	var sessionId      = null;
  var currentSession = null;

	getSession(io, socket)
		.then(function(session){
			sessionId      = session._id;
			currentSession = session;
			return when.all([
				currentSession.questionsForSlide(evt.slide),
      	currentSession.statQuestionsForSlide(evt.slide)
			]);
		})
		.then(function(results) {
			var activeQuestions 		 = results[0];
    	var activeStatsQuestions = results[1];

    	notifyNamespaces('asq:goto', evt, io, sessionId, 'ctrl', 'folo', 'wtap');
      
      currentSession.activeSlide = evt.slide;
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

var gotosub = function(io, socket, evt) {
	getSession(io, socket, function(err, session){
		if (err) {
			throw err;
		}
		notifyNamespaces('asq:gotosub', evt, io, sessionid, 'ctrl', 'folo', 'wtap');
    session.activeSubstep = evt.substepIndex;
    session.save(function(err) {
			if (err) { throw err; }
    });
	});

}

var submit = function(io, socket, evt) {
	var Question = db.model('Question', schemas.questionSchema);
	when.all([
		getSession(io, socket),                 //SessionId
		getDisplayName(socket),                    //Socket (user) name
		Question.findById(evt.questionId).exec() //Question
	]).then(
		function updateAnswer(data) {
			var score = arrayEqual(evt.answers, data[2].getSolution()) ? 100 : 0
			, Answer  = db.model('Answer', schemas.answerSchema);
			Answer.findOneAndUpdate({
				session  : data[0],    //SessionId
				answeree : data[1],    //Socket (user) name
				question : data[2]._id //_id attr. of question
			}, {
				submission  : evt.answers,
				correctness : score
			}, { upsert : true // Create the answer if it does not exist
												 // This allow for resubmission.
												 // (needs to be changed for peer assessment)
			}, function notifySubmitted(err, answer) {
					if (err) {
						console.log(err);
						throw err;
					}
					var resEvent = { questionId : evt.questionId }
					socket.emit('asq:submitted', resEvent);
					notifyNamespaces('asq:submitted', resEvent, io, data[0], 'ctrl');
				});
		},
		function(err) {
			console.log(err);
			throw err;
		});
}

var terminate = function(io, socket, evt) {
	var User 			= db.model('User', schemas.userSchema);
	var Session 	= db.model('Session', schemas.sessionSchema);
	var sessionId = null;

	getSessionId(io, socket).then(
		function updateSession(sessionId) {
			sessionId = session._id;
			return Session.findByIdAndUpdate(sessionId, {
				endDate : newDate
			}).exec();
		}).then(
		function updateUser(session) {
			return User.findByIdAndUpdate(session.presenter, {
				current : null
			}).exec();
		}).then (
		function notifyTerminated(user) {
			notifyNamespaces('asq:session-terminated', {}, io, sessionId,
				'ctrl', 'folo', 'wtap', 'stat');
		}, function onError(err) {
			logger.error('Error on terminate session:\n\t' + err.toString());
		});
}

function deleteAndNotify(socket, data, namespace, toNotify) {
	var args 				= Array.prototype.slice.call(arguments, 3);
	var sessionId   = data[0];
	var	displayName = data[1];
	var eventName 	= 'asq:' + namespace + '-disconnected';
	var evt 				= { displayName : displayName };
	
	
	delete socket;
	notifyNamespaces(eventName, evt, io, sessionId, args);
	logger.info('[' + namespace.toUpperCase() + '] '
		+ displayName + " disconnected");
}

var ioConnect = function(io, socket, namespace, clientName) {
	socket.set('sessionId', socket.handshake.session._id); //easier to retrieve.
	socket.join(socket.handshake.session._id);
	socket.emit('asq:goto', { slide: socket.handshake.session.activeSlide });
	logger.info('[' + namespace.toUpperCase() + '] ' + clientName + " connected");
}

var ctrlConnect = function(io, socket) {
	var displayName = socket.handshake.displayName;
	var sessionId 	= socket.handshake.session._id;
	var evt    			= { name : displayName };

	socket.set('displayName', displayName);
	ioConnect(io, socket, 'ctrl', displayName);
	notifyNamespaces('asq:ctrl-connected', evt, io, sessionId,
			'ctrl', 'wtap', 'folo');
}

var ctrlDisconnect = function(io, socket) {
	console.log('CTRL Disconnect');
	when.all([
		getSessionId(socket),
		getDisplayName(socket)
	]).then(
	function delAndNotify(data) {
		deleteAndNotify(socket, data, 'ctrl', 'ctrl', 'folo', 'wtap');
	},
	function ctrlDisconnectErr(err) {
		appLogger.error('Failed to disconnect client from \'ctrl\':\n\t'
			+ err.toString());
	});
}

var foloConnect = function(io, socket) {
	var displayName = socket.handshake.displayName;
	var sessionId 	= socket.handshake.session._id;
	var evt   	 		= { name : displayName }

	socket.set('displayName', displayName);
	ioConnect(io, socket, 'folo', displayName);
	notifyNamespaces('asq:folo-connected', evt, io, sessionId,
			'ctrl', 'wtap', 'folo');
}

var foloDisconnect = function(io, socket) {
	when.all([
		getSessionId(socket),
		getDisplayName(socket)
	]).then(
	function delAndNotify(data) {
		deleteAndNotify(socket, data, 'folo', 'ctrl', 'folo', 'wtap');
	},
	function foloDisconnectErr(err) {
		appLogger.error('Failed to disconnect client from \'folo\':\n\t'
			+ err.toString());
	});
}

var wtapConnect = function(io, socket) {
	ioConnect(io, socket, 'wtap', 'Wtap client');
}

var wtapDisconnect = function(io, socket) {
	getSessionId(socket).then(
	function handleDisconnect(sessionId) {
		deleteAndNotify(socket, [sessionId, 'Wtap client'], 'wtap', 'ctrl');
	},
	function wtapDisconnectErr(err) {
		appLogger.error('Failed to disconnect client from \'wtap\':\n\t'
			+ err.toString());
	});
}

var statConnect = function(io, socket) {
	ioConnect(io, socket, 'stat', 'Stat client');
}

var statDisconnect = function(io, socket) {
	getSessionId(socket).then(
	function handleDisconnect(sessionId) {
		deleteAndNotify(socket, [sessionId, 'Stat client'], 'stat', 'ctrl');
	},
	function wtapDisconnectErr(err) {
		appLogger.error('Failed to disconnect client from \'stat\':\n\t'
			+ err.toString());
	});
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
	statDisconnect : statDisconnect,
	terminate 		 : terminate
}