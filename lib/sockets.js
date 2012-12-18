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
    var Session = db.model('Session', schemas.sessionSchema);
    var Question = db.model('Question', schemas.questionSchema);
    var Answer = db.model('Answer', schemas.answerSchema);
    io = socketio.listen(server);

    io.configure('development', function() {
    	io.set('log level', 1);

      //see if we know the fellow
      io.set('authorization', function (data, callback) {
        if(data.headers.cookie) {
            // save parsedSessionId to handshakeData
            data.cookie = cookie.parse(data.headers.cookie);
            data.sessionId = parseSignedCookie(data.cookie['connect.sid'], 'ASQsecret');
        }
        callback(null, true);
      });


      //use session to see if user is connected
      io.on('connection', function(socket) {
        // reference to my initialized sessionStore in app.js
        var sessionStore = config.sessionStore;
        var sessionId    = socket.handshake.sessionId;

        sessionStore.get(sessionId, function(err, session) {
          if( ! err) {
            if(session.passport.user) {
              console.log('This is the users id is %s', session.passport._id);
            }
          };
        });

      });

    });

    var getSession = function(socketId){
        for (room in io.sockets.manager.roomClients[socketId]) {
            if (room.length > 6) return room.slice(6);
        }
        return undefined;
    }

    var goto = function(event, socketId) {
        var sessionId = getSession(socketId);
        if (!sessionId) return;
        Session.findById(sessionId, function(err, session) {
            session.question(function(err, question){
                //if no questions go to next slide or not showing one
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

    var update = function(socket) {
        var sessionId = getSession(socket.id);
        if (!sessionId) return;
        Session.findById(sessionId, function(err, session){
            console.log('Session state');
            console.log(session.showingQuestion);
            console.log(session.showingAnswer);
            if(session.showingQuestion || session.showingAnswer) {
                session.question(function(err, question) {
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
    //.authorization(passportSocketio.authorize({
    //    sessionKey: '???',
    //    sessionStore: '???',
    //    sessionSecret: '???'}
    //));

    var folo = io.of('/folo');

    ctrl.on('connection', function(socket) {
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

        socket.on('asq:start', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            Session.findByIdAndUpdate(sessionId, {$set: {started : true, activeSlide: event.slide}} ,function(err, session) {
                ctrl.in(sessionId).emit('asq:start', event);
                folo.in(sessionId).emit('asq:start', event);
                console.log('activeSlide ' + session.activeSlide);
            });
        });

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
                ctrl.in(event.session).emit('asq:new-viewer', {users: session.viewers.length});
                }
                
            });
        });

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
                            console.log('answer');
                            console.log(answer);
                            //First submited answer for that question.
                            // Creating new answerSchema
                            if (answer === null) {
                                answer = new Answer();
                                answer.question = event.questionId;
                                answer.answers.push({user: nickname, content: event.answers});
                                session.answers.push(answer._id);//add new answerSchema ref to session
                                session.save(function(err) {
                                    //Notifes ctrl of particpation
                                    ctrl.in(sessionId).emit('asq:submit',
                                                            {submitted:1,
                                                            users:session.viewers});
                                });
                            // Else updating existing answerSchema
                            } else {
                                for(var i = 0; i <  answer.answers.length; i++) {
                                    if (answer.answers[i].user === String(nickname)) { //update submission
                                        answer.answers[i].content = event.answers;
                                        console.log('updating submission at entry ' + i);
                                        break;
                                    }
                                }
                                if (i === answer.answers.length) { //new submission
                                    answer.answers.push({user: nickname, content: event.answers});
                                    console.log('new submission ' + i);
                                    //Noties ctrl of participation
                                    ctrl.in(sessionId).emit('asq:submit',
                                                            {submitted: answer.answers.length,
                                                            users: session.viewers});
                                }
                            }
                            answer.save(function(err){
                                if(err) throw err;
                                console.log('saved');
                                console.log(answer);
                            });
                        });
                   });
                });
                //Session.findById(sessionId, function(err,session) {
                //    if (session) {
                //        var exists=0;
                //        for (var i=0;i<session.answers.length;i++) {
                //            console.log(i);
                //            Answer.findById(session.answers[i],function(err,answer) {
                //                if (answer.question==event.questionId) {
                //                    exists=session.answers[i];
                //                    answer.answers.push(new Object({user:user, content:event.answers}));
                //                    answer.save();
                //                    console.log(answer.answers);
                //                }
                //                if (i==session.answers.length) {
                //                    if (exists==0) {
                //                        var submission = new Answer();
                //                            submission.question = event.questionId;
                //                            submission.answers.push(new Object({user:user, content:event.answers}));
                //                            session.answers.push(submission._id);
                //                            session.save();
                //                            submission.save();
                //                            console.log("shit");
                //                            console.log(submission.answers);
                //                    }
                //                }
                //            });
                //        }
                //        if (session.answers.length==0) {
                //            var submission = new Answer();
                //            submission.question = event.questionId;
                //            submission.answers.push(new Object({user:user, content:event.answers}));
                //            session.answers.push(submission._id);
                //            session.save();
                //            submission.save();
                //            console.log("shit");
                //            console.log(submission.answers);
                //        }
                //    }
                //});
                
            });
        });

        socket.on('disconnect', function(event) {
            var sessionId = getSession(socket.id);
            if (!sessionId) return;
            socket.get('Nickname', function(err, nickname) {
                Session.findByIdAndUpdate(sessionId, {$pop: {viewers: nickname}}, function(err, session) {
                   ctrl.in(sessionId).emit('asq:viewer-disconnect', {users: session.viewers.length});
                });
            });
        })
    });
    return io;
}