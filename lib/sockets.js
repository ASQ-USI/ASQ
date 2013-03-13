/** @lib lib/sockets
 * 	@author Jacques Dafflon jacques.dafflon@gmail.com
 * 	@description Websocket interaction is defined here.
 * 	TODO socket authentification is unstable and crashes the server. It is
 * 	disabled for now (commented out) but needs to be fixed.
 *
 */
var socketio            = require('socket.io')
 // , passportSocketio    = require('passport.socketio')
  , schemas             = require('../models/models')
  , registration        = require('../routes/registration')
  , util                = require('util')
  , connect             = require('connect')
  , parseSignedCookie   = connect.utils.parseSignedCookie
  , cookie              = require('express/node_modules/cookie');

var config = require('../config.js');

module.exports.listen = function(server) {
    var nickname = 1;
    var User = db.model('User', schemas.userSchema);
    var Session = db.model('Session', schemas.sessionSchema);
    var Question = db.model('Question', schemas.questionSchema);
    var Answer = db.model('Answer', schemas.answerSchema);
    io = socketio.listen(server);

    io.configure('development', function() {
    	io.set('log level', 2);


	//TODO socket authentification: unstable and needs to be fixed
      //see if we know the fellow
      //io.set('authorization', function (data, callback) {
      //  if(data.headers.cookie) {
      //      // save parsedSessionId to handshakeData
      //      data.cookie = cookie.parse(data.headers.cookie);
      //      data.sessionId = parseSignedCookie(data.cookie['connect.sid'], 'ASQsecret');
      //  }
      //  callback(null, true);
      //});


      //use session to see if user is connected
      //io.on('connection', function(socket) {
      //  // reference to my initialized sessionStore in app.js
      //  var sessionStore = config.sessionStore;
      //  var sessionId    = socket.handshake.sessionId;
      //
      //  sessionStore.get(sessionId, function(err, session) {
      //    if( ! err) {
      //      if(session.passport.user) {
      //        console.log('This is the users id is %s', session.passport._id);
      //      }
      //    };
      //  });
      //});

    });

    /*
	 * Returns the session from which the socket is a member of (this should be
	 * unique.) or null if it has none.
	 */
	var getSession = function(socketId){
        for (room in io.sockets.manager.roomClients[socketId]) {
            if (room.length > 6) return room.slice(6);
        }
        return undefined;
    }

    /*
	 * Given a socket id, send a goto event to all the sockets in the ctrl and
	 * folo namespaces who have the same session as the socket whose id was
	 * given as paramter.
	 * This function does not necessarily send a "asq:goto-event" but the next
	 * logical event which could be to show/hide a question or answer and such.
	 */
	var goto = function(event, socketId) {
        var sessionId = getSession(socketId);
        if (!sessionId) return;
        Session.findById(sessionId, function(err, session) {
            session.question(function(err, question){
                //if no questions go to next slide
                if(!question) {
                    console.log('goto confirmed');
                    ctrl.in(sessionId).emit('asq:goto', event);
                    folo.in(sessionId).emit('asq:goto', event);
                    session.activeSlide = event.slide;
                    session.save(function(err) {
                        if (err) throw err;
                    });
                //shown question and answer: hide it
                } else if (question && !session.showingQuestion && session.showingAnswer) {
                    console.log('hide answer');
                    session.showingAnswer = false;
                    session.questionsDisplayed.push(question._id);
                    ctrl.in(sessionId).emit('asq:hide-answer', event);
                    folo.in(sessionId).emit('asq:hide-answer', event);
                    session.save(function(err) {
                        if (err) throw err;
                    });
                //else send question
                } else if (question && !session.showingQuestion) {
                    question.displayQuestion(false, function(err, displayQuestion){
                        console.log('question event');
                        ctrl.in(sessionId).emit('asq:question', {question: displayQuestion});
                        folo.in(sessionId).emit('asq:question', {question: displayQuestion});
                        session.showingQuestion = true;
                        session.save(function(err) {
                            if (err) throw err;
                        });
                    });
				/*
				 * Should not be needed anymore as showing answers is not taken
				 * care of by this function.
				 */
                /*//else if question and showing it: show answer
                } else if (question && session.showingQuestion) {
                    question.displayQuestion(true, function(err, displayQuestion) {
                            registration.getStats(question._id, function(err, stats) {
                                console.log('answer event');
                                ctrl.in(sessionId).emit('asq:answer', {question: displayQuestion, stats: stats});
                                folo.in(sessionId).emit('asq:answer', {question: displayQuestion});
                                session.showingQuestion = false;
                                session.showingAnswer = true;
                                session.save(function(err) {
                                    if (err) throw err;
                                });
                        });
                    });
*/
                }
            });
        });
    }

    /**
     * When a socket connects update it to the current status of slideshow.
     * If showing a question or answer, shows it as well, otherwise goes to
     * the current slide.
     */
    var update = function(socket) {
        var sessionId = getSession(socket.id);
        if (!sessionId) return;
        Session.findById(sessionId, function(err, session){
            if ( ! session) return;
            if(session.showingQuestion || session.showingAnswer) {
                session.question(function(err, question) {
                    if (! question) {
                        socket.emit('asq:goto', {slide: session.activeSlide});
                        return;
                    }
                    question.displayQuestion(session.showingAnswer,
                                             function(err, displayQuestion){
                        socket.emit(session.showingAnswer ?
                                    'asq:answer' : 'asq:question',
                                    {question: displayQuestion});
                    });
                });
            } else {
                socket.emit('asq:goto', {slide: session.activeSlide});
            }
        });
    }

    var ctrl = io
    .of('/ctrl')
	// Socket authentification commented out below: Needs to be fixed.
    /*.authorization(function (data, callback) {
        if(data.headers.cookie) {
            // save parsedSessionId to handshakeData
            data.cookie = cookie.parse(data.headers.cookie);
            data.sessionId = parseSignedCookie(data.cookie['connect.sid'], 'ASQsecret');
            var sessionStore = config.sessionStore;
            sessionStore.get(data.sessionId, function(err, session) {
                if (err) { //something went wrong
                    callback(err, false);
                    console.log('auth 1');
                    return;
                }
                if ( ! session) { //session not found
                    callback(null, false);
                    console.log('auth 2');
                    return;
                }
                if (session.passport.user) {
                    User.findById(session.passport.user, function(err, user) {
                         if (err) { //something went wrong
                            callback(err, false);
                            console.log('auth 3');
                            return;
                        }
                        if ( ! user || !user.current) {//user not found
                            callback(null, false);     // or no live session
                            console.log(session.passport.user);
                            console.log('auth 4');
                            return;
                        }
                        console.log('auth 5 ok');
                        callback(null, true);

                    });
                } else {
                    console.log('auth 6');
                    callback(null, false); //no user info in this request ?
                }
            }); //no auth data... ?
        } else {
            console.log('auth 7');
            callback(null, false);
        }
      });*/

    /* Folo namespace for followers without control on the session.
	 * Authetification allows anyone without checking for credentials.
	 * It is used as a hack to limit the numbers of clients.
	 */
	var folo = io.of('/folo').authorization(function(handshakeData, callback) {
        //Limit number of sockets connection in folo to clientsLimit
        //(Global var defined in app.js, second arg passed when running the server)
        callback(null, io.of('/folo').clients().length < clientsLimit);
    });

	/*
	 * Ctrl namespace used for authentificated clients to control the session.
	 * So fare authentification on the socket does not work which means we rely
	 * on client-side filtering and client code to connect in the ctrl namespace
	 * which is absolutely terrible! This needs to be fixed quickly.
	 */
    ctrl.on('connection', function(socket) {
        /*var sessionStore = config.sessionStore;
        var sessionId    = socket.handshake.sessionId;

        sessionStore.get(sessionId, function(err, session) {
            if (err) throw err;
            if ( ! session) { //session not found
                socket.disconnect();
                return;
            }
            if (session.passport.user) {
                User.findById(session.passport.user, function(err, user) {
                     if (err) throw err;
                    if ( ! user || !user.current) {//user not found
                        socket.disconnect();     // or no live session
                        return;
                    }
                    socket.join(user.current);

                });
            } else {
                socket.disconnect();
            }
        });*/

        /** @function Handle connection from admin. */
        socket.on('asq:admin', function(event) {
            console.log('new admin')
            Session.findById(event.session, function(err, session) {
            	if (session) {
            		socket.join(event.session);
                    if (session.started) { //query database
                       socket.emit('asq:start', {});
                   }
                    update(socket);
                }
            });
        });

        /**
           @ function Handle goto event.
           When a goto event from an admin is sent, update status of current slide
           and informs all viewers of the new current slide
           @todo Implement authentification to make sure the event comes from a
           valid admin.
         */
        socket.on('asq:goto', function(event) {
            goto(event, socket.id);
        });

        //go to next slide even if there is a question
        //(unused for now)
        socket.on('asq:goto-force', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            Session.findById(sessionId, function(err, session) {
                ctrl.in(sessionId).emit('asq:goto', event);
                folo.in(sessionId).emit('asq:goto', event);
                session.activeSlide = event.slide;
                session.save(function(err) {
                    if (err) throw err;
                });
            });
        });

		/*
		 * Event which handles the begining of a session (hides welcome popup)
		 */
        socket.on('asq:start', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            Session.findByIdAndUpdate(sessionId, {$set: {started : true, activeSlide: event.slide}} ,function(err, session) {
                ctrl.in(sessionId).emit('asq:start', event);
                folo.in(sessionId).emit('asq:start', event);
            });
        });

        /*
		 * Event to show stats of a current question.
		 * Not optimal: needs imporovment notably on checks for when it is
		 * called.
		 */
		socket.on('asq:show-stats', function(event) {
            console.log('show-stats');
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            Session.findById(sessionId, function(err, session) {
                console.log('showing question ' + session.showingQuestion);
                if (!session.showingQuestion) return;
                session.question(function(err, question){
                    question.displayQuestion(true, function(err, displayQuestion) {
                        registration.getStats(question._id, sessionId, function(err, stats) {
                            if(err) throw err;
                            console.log(stats);
                            console.log('answer event');
                            ctrl.in(sessionId).emit('asq:answer', {question: displayQuestion, stats: stats});
                            folo.in(sessionId).emit('asq:answer', {question: displayQuestion});
                            session.showingQuestion = false;
                            session.showingAnswer = true;
                            session.save(function(err) {
                                if (err) throw err;
                            });
                        });
                    });
                });
            });
        });
    });

	/*
	 * Handle connection to the folo namespace from a new socket.
	 * Not working corectly on load. Some stress tests needed to debug
	 * (See disconnect for more details.)
	 */
    folo.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('asq:viewer', function(event) {
            Session.findByIdAndUpdate(event.session, {$push: {viewers: nickname}}, function(err, session) {
                if (session) {
                    //nickname is just an increasing counter
                socket.set('nickname', nickname);
                console.log('Set user nickname: ' + nickname);
                nickname++;
                socket.join(event.session);
                if (session.started) { //query database
                    socket.emit('asq:start', {});
                }
                update(socket);
                ctrl.in(event.session).emit('asq:viewers-update', {users: session.viewers.length});
                }

            });
        });

		/*
		 * Handle submission of data to a question from socket in the folo
		 * namespace.
		 */
        socket.on('asq:submit', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId || !event.questionId) return;
            socket.get('nickname', function(err, nickname) {
                if (err) throw err;
                var user = nickname || 'unknown';
                Session.findById(sessionId, function(err, session) {
                    session.question(function(err, question) {
                        //Not accepting submissions for questions other than current one.
                        if (!question || question._id.toString() !== event.questionId) return;
                        Answer.findOne({_id: {$in: session.answers}, question:event.questionId}, function(err, answer) {
                            //First submited answer for that question.
                            // Creating new answerSchema
                            if (answer === null) {
                                answer = new Answer();
                                answer.question = event.questionId;
                                answer.answers.push({user: nickname, content: event.answers});
                                session.answers.push(answer._id);//add new answerSchema ref to session
                                session.save(function(err) {
                                });
                            // Else updating existing answerSchema
                            } else {
                                for(var i = 0; i <  answer.answers.length; i++) {
                                    if (answer.answers[i].user === String(nickname)) { //update submission
                                        answer.answers[i].content = event.answers;
                                        answer.answers[i].final = true;
                                        console.log('updating submission at entry ' + i);
                                        break;
                                    }
                                }
                                if (i === answer.answers.length) { //new submission
                                    answer.answers.push({user: nickname, content: event.answers});
                                }
                            }
                            //Notifes ctrl of participation
                            var submitted = 0;
                            for(var i = 0; i < answer.answers.length; i++) {
                                if (answer.answers[i].final) submitted++;
                            }
                            ctrl.in(sessionId).emit('asq:submit',
                                                   {submitted: submitted,
                                                    users: session.viewers.length});
                            answer.save(function(err){
                                if(err) throw err;
                            });
                        });
                   });
                });
                /*Session.findById(sessionId, function(err,session) {
                    if (session) {
                        var exists=0;
                        for (var i=0;i<session.answers.length;i++) {
                            console.log(i);
                            Answer.findById(session.answers[i],function(err,answer) {
                                if (answer.question==event.questionId) {
                                    exists=session.answers[i];
                                    answer.answers.push(new Object({user:user, content:event.answers}));
                                    answer.save();
                                    console.log(answer.answers);
                                }
                                if (i==session.answers.length) {
                                    if (exists==0) {
                                        var submission = new Answer();
                                            submission.question = event.questionId;
                                            submission.answers.push(new Object({user:user, content:event.answers}));
                                            session.answers.push(submission._id);
                                            session.save();
                                            submission.save();
                                            console.log("shit");
                                            console.log(submission.answers);
                                    }
                                }
                            });
                        }
                        if (session.answers.length==0) {
                            var submission = new Answer();
                            submission.question = event.questionId;
                            submission.answers.push(new Object({user:user, content:event.answers}));
                            session.answers.push(submission._id);
                            session.save();
                            submission.save();
                            console.log("shit");
                            console.log(submission.answers);
                        }
                    }
                });*/

            });
        });

        /**
         *  Just indicates that someone will resubmit an answer,
         *  compute the number of submitted answers and notifie ctrl
         */
        socket.on('asq:resubmit', function(event){
            console.log('ASQ received resubmmit');
            var sessionId = getSession(socket.id);
            if (!sessionId || !event.questionId) return;
            socket.get('nickname', function(err, nickname) {
                if (err) throw err;
                if (!nickname) return;
                console.log('from ' + nickname);
                Session.findById(sessionId, function(err, session) {
                    session.question(function(err, question) {
                        //Not accepting submissions for questions other than current one.
                        if (!question || question._id.toString() !== event.questionId) return;
                        Answer.findOne({ _id:{ $in:session.answers }, question:event.questionId }, function(err, answer) {
                            if (err) throw err;
                            if ( ! answer) return;
                            var submitted = 0;
                            for (var i = 0; i < answer.answers.length; i++) {
                                if (answer.answers[i].user === String(nickname)) {
                                    answer.answers[i].final = false;
                                } else if (answer.answers[i].final) submitted++;
                            }
                            //Notifes ctrl of participation
                            ctrl.in(sessionId).emit('asq:submit',
                                                   {submitted: submitted,
                                                    users: session.viewers.length});
                            answer.save(function(err){
                                if(err) throw err;
                            });

                        });
                    });
                });
            });
        });

		/* Handle disconnect event of a socket from the folo namespace.
		 * Does not work properly but some stress tests will be needed to find
		 * the problem. (Count does not seem to match relaity).
		 */
        socket.on('disconnect', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            socket.get('nickname', function(err, nickname) {
                Session.findByIdAndUpdate(sessionId, {$pop: {viewers: nickname}}, function(err, session) {
                   ctrl.in(sessionId).emit('asq:viewers-update', {users: session.viewers.length});
                });
            });
        })
    });
    return io;
}
