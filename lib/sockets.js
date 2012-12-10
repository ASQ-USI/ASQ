var socketio = require('socket.io')
  , passportSocketio = require('passport.socketio')
  , schemas = require('../models/models.js');

module.exports.listen = function(server) {
    var nickname = 0;
    var Session = db.model('Session', schemas.sessionSchema);
    var Question = db.model('Question', schemas.questionSchema);
    var Answer = db.model('Answer', schemas.answerSchema);
    var currentSlide = 0;
    var started = false;
    io = socketio.listen(server);
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
        socket.on('admin', function(event) {
            socket.join(event.session);
        });

        /**
           @ function Handle goto event.
           When a goto event from an admin is sent, update status of current slide
           and informs all viewers of the new current slide
           @todo Implement authentification to make sure the event comes from a
           valid admin.
         */
        socket.on('goto', function(event) {
            Session.findById(event.session, function(err, session) {
                console.log('nextQuestion');
                console.log(session.nextQuestion);
                //if no questions go to next slide or not showing one
                if(session.nextQuestion === undefined ||
                   !session.showingQuestion) {
                    //if showing an answer: hide it
                    if (session.showingAnswer) {
                        session.showingAnswer = false;
                        ctrl.in(event.session).emit('hide', event);
                        folo.in(event.session).emit('hide', event);
                    }
                    ctrl.in(event.session).emit('goto', event);
                    folo.in(event.session).emit('goto', event);
                    session.activeSlide = event.slide;
                    session.save(function(err) {
                        if (err) throw err;
                    });
                //else send question
                } else {
                    ctrl.in(event.session).emit('question', {question: session.nextQuestion});
                    folo.in(event.session).emit('question', {question: session.nextQuestion});
                    session.showingQuestion = true;
                    session.save(function(err) {
                        if (err) throw err;
                    });
                }
            });
        });
        //Send answer from question id (stored in event)
        socket.on('show:answer', function(event) {
            Session.findbyId(event.session, function (err, session) {
                if (err) throw err;
                if(session.showingQuestion && !session.showingAnswer) { //if block then we are showing a question
                    Question.findById(event.questionId, function(err, question) {
                        ctrl.in(event.session).emit('answer', {answer: question.answeroptions});
                        folo.in(event.session).emit('answer', {answer: question.answeroptions});
                        session.showingQuestion = false;
                        session.showingAnswer = true;
                        session.save(function(err) {
                            if (err) throw err;
                        });
                    });
                }
            });
        });
        
        //go to next slide even if there is a question
        //(unused for now)
        socket.on('goto-force', function(event) {
            Session.findById(event.session, function(err, session) {
                ctrl.in(event.session).emit('goto', event);
                folo.in(event.session).emit('goto', event);
                session.activeSlide = event.slide;
                session.save(function(err) {
                    if (err) throw err;
                });
            });
        });

        socket.on('impress:start', function(event) {
            started = true;
            ctrl.in(event.session).emit('impress:start', event);
            folo.in(event.session).emit('impress:start', event);
        });
    });

    folo.on('connection', function(socket) {
        /** @function Handle connection from viewer. */
        socket.on('viewer', function(event) {
            //nickname is just an increasing counter
            socket.set('nickname', nickname++);
            socket.join(event.session);
            if (started) { //query database
                socket.emit('impress:start', {});
            }
            socket.emit('goto', {slide:currentSlide});
            ctrl.in(event.session).emit('new', {});
        });

        socket.on('submit', function(event) {
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