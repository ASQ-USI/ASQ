var socketio = require('socket.io')
  , passportSocketio = require('passport.socketio')
  , schemas = require('../models/models.js');

module.exports.listen = function(server) {
    var nickname = 0;
    var Session = db.model('Session', schemas.sessionSchema);
    var Question = db.model('Question', schemas.questionSchema);
    var Answer = db.model('Answer', schemas.answerSchema);
    io = socketio.listen(server);

    var goto = function(event) {
        console.log('goto');
        Session.findById(event.session, function(err, session) {
            session.question(function(err, question){
                //if no questions go to next slide or not showing one
                if((!question && !session.showingQuestion)
                   || session.showingAnswer) {
                    console.log('goto confirmed')
                    //if showing an answer: hide it
                    if (session.showingAnswer) {
                        session.showingAnswer = false;
                        ctrl.in(event.session).emit('asq:hide-answer', event);
                        folo.in(event.session).emit('asq:hide-answer', event);
                    }
                    ctrl.in(event.session).emit('asq:goto', event);
                    folo.in(event.session).emit('asq:goto', event);
                    session.activeSlide = event.slide;
                    session.save(function(err) {
                        if (err) throw err;
                    });
                //else if question and showing it: show answer
                } else if (question && session.showingQuestion) {
                    question.displayQuestion(true, function(err, displayQuestion) {
                       console.log('answer event');
                        ctrl.in(event.session).emit('asq:answer', {question: displayQuestion});
                        folo.in(event.session).emit('asq:answer', {question: displayQuestion});
                        session.showingQuestion = false;
                        session.showingAnswer = true;
                        session.questionsDisplayed.push(question._id);
                        session.save(function(err) {
                            if (err) throw err;
                        });
                    });
                //else send question
                } else {
                    question.displayQuestion(false, function(err, displayQuestion){
                        console.log('question event');
                        ctrl.in(event.session).emit('asq:question', {question: displayQuestion});
                        folo.in(event.session).emit('asq:question', {question: displayQuestion});
                        session.showingQuestion = true;
                        session.save(function(err) {
                            if (err) throw err;
                        });
                    });
                }
            });
        });
    }

    var ctrl = io
    .of('/ctrl')
    /*.authorization(passportSocketio.authorize({
        sessionKey: '???',
        sessionStore: '???',
        sessionSecret: '???'}
    ));*/

    var folo = io.of('/folo');

    ctrl.on('connection', function(socket) {
        /** @function Handle connection from admin. */
        socket.on('asq:admin', function(event) {
            console.log('new admin')
            Session.findById(event.session, function(err, session) {
                socket.join(event.session);
                    if (session.started) { //query database
                       socket.emit('asq:start', {});
                   }

                goto(event);
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
            console.log(io.sockets.manager.roomClients[socket.id]);
            goto(event);
        });
        
        //go to next slide even if there is a question
        //(unused for now)
        socket.on('asq:goto-force', function(event) {
            Session.findById(event.session, function(err, session) {
                ctrl.in(event.session).emit('asq:goto', event);
                folo.in(event.session).emit('asq:goto', event);
                session.activeSlide = event.slide;
                session.save(function(err) {
                    if (err) throw err;
                });
            });
        });

        socket.on('asq:start', function(event) {
            Session.findByIdAndUpdate(event.session, {$set: {started : true, activeSlide: event.slide}} ,function(err, session) {
                ctrl.in(event.session).emit('asq:start', event);
                folo.in(event.session).emit('asq:start', event);
            });
        });
    });

    folo.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('asq:viewer', function(event) {
            Session.findById(event.session, function(err, session) {
                //nickname is just an increasing counter
                socket.set('nickname', nickname++);
                socket.join(event.session);
                if (session.started) { //query database
                    socket.emit('asq:start', {});
                }
                socket.emit('asq:goto', {slide:session.activeSlide});
                ctrl.in(event.session).emit('asq:new-viewer', event);
            });
        });

        socket.on('asq:submit', function(event) {
            socket.get('nickname', function(err, nickname) {
                if (err) throw err;
                var user = nickname || 'unknown';
                var submission = new Answer();
                submission.question = event.questionId;
                submission.answers = {user: user, content: event.data};
                Session.findByIdAndUpdate(event.session,
                                        { $push: {answers: submission._id} },
                                        function(err, session) {
                                            submission.save();
                                        });
            })
        });
    });
    return io;
}