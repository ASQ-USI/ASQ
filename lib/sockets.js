/** @lib lib/sockets
 * 	@author Jacques Dafflon jacques.dafflon@gmail.com
 * 	@description Websocket interaction is defined here.
 * 	TODO socket authentification is unstable and crashes the server. It is
 * 	disabled for now (commented out) but needs to be fixed.
 *
 */
var socketio        = require('socket.io')
, registration      = require('../routes/registration')
, util              = require('util')
, connect           = require('connect')
, cookie            = require('cookie')
, redis             = require('redis')
, redisClient       = redis.createClient(6379, '127.0.0.1')
, ObjectId          = require('mongoose').Schema.ObjectId
, when              = require('when')
, _                 = require('underscore')
, utils             = require('./utils')
, authentication    = require('./authentication')

var config = require('../sessionMongooseConfig');

module.exports.listen = function(server) {
  var nickname = 1;
  var User = db.model('User');
  var Session = db.model('Session')
  , Question = db.model('Question')
  , Answer = db.model('Answer');
  
  io = socketio.listen(server);

  io.configure('development', function() {
  	io.set('log level', 2);
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
     //TODO: event has already sessionId why take if from socketId
     //Reason: event comes from the client, it is better to take the sessionId
     //        from the room the socket registered in instead of trusting the client.
    var sessionId = getSession(socketId)
    , currentSession;
    if (!sessionId) return;
    Session.findById(sessionId).exec()

      .then(
        function(session) {
          currentSession = session;
          return when.all([
            currentSession.questionsForSlide(event.slide),
            currentSession.statQuestionsForSlide(event.slide)
            ]);
      })

      .then(
        function(results){
          var activeQuestions =  results[0]
          , activeStatsQuestions = results[1];

          ctrl.in(sessionId).emit('asq:goto', event);
          folo.in(sessionId).emit('asq:goto', event);
          
          currentSession.activeSlide = event.slide;
          currentSession.activeQuestions = results[0];
          currentSession.activeStatsQuestions = results[1];

          var folos = folo.clients()

          console.log("nicknames");
          console.log(folo.clients(sessionId));
          for (var i=0; i<folo.clients(sessionId).length; i++) {
            folo.clients(sessionId)[i].get('nickname', function(err, name){
              if (err) { console.log("wrong... " + err ); }
              else { console.log('nickname ' + name); }
            })
          }

          for (var i=0; i< folos.length; i++){
            var foloClient = folos[i];
            foloClient.get('nickname', function(err, nickname) {
              if (err || nickname == null){ return; }

              Answer.find({
                  _id       : { $in : currentSession.answers },
                  answeree  : nickname,
                  question  : { $in : currentSession.activeStatsQuestions }
                }, function(err, answers){
                    if(err) { throw err; }

                    var clientAnswers = answers;
                    Question.find({
                        _id : {$in: currentSession.activeStatsQuestions},
                      }, function(err, questions){
                          if (err) { throw err; }
                          console.log('Sending stats to ' + nickname);
                          foloClient.emit('asq:stat', { 
                            questions : questions,
                            answers   : clientAnswers
                          });
                    });
              });
            });
          }

          currentSession.save(function(err) {
            if (err) { throw err; }
          });
      });
  }
	// var goto = function(event, socketId) {
 //        var sessionId = getSession(socketId);
 //        if (!sessionId) return;
 //        Session.findById(sessionId, function(err, session) {
 //            session.question(function(err, question){
 //                //if no questions go to next slide
 //                if(!question) {
 //                    console.log('goto confirmed');
 //                    ctrl.in(sessionId).emit('asq:goto', event);
 //                    folo.in(sessionId).emit('asq:goto', event);
 //                    session.activeSlide = event.slide;
 //                    session.save(function(err) {
 //                        if (err) throw err;
 //                    });
 //                //shown question and answer: hide it
 //                } else if (question && !session.showingQuestion && session.showingAnswer) {
 //                    console.log('hide answer');
 //                    session.showingAnswer = false;
 //                    session.questionsDisplayed.push(question._id);
 //                    ctrl.in(sessionId).emit('asq:hide-answer', event);
 //                    folo.in(sessionId).emit('asq:hide-answer', event);
 //                    session.save(function(err) {
 //                        if (err) throw err;
 //                    });
 //                //else send question
 //                } else if (question && !session.showingQuestion) {
 //                    question.displayQuestion(false, function(err, displayQuestion){
 //                        console.log('question event');
 //                        ctrl.in(sessionId).emit('asq:question', {question: displayQuestion});
 //                        folo.in(sessionId).emit('asq:question', {question: displayQuestion});
 //                        session.showingQuestion = true;
 //                        session.save(function(err) {
 //                            if (err) throw err;
 //                        });
 //                    });
 //                }
 //            });
 //        });
 //    }



  var gotosub = function(event, socketId) {
      var sessionId = getSession(socketId);
      if (!sessionId) { return; }
      Session.findById(sessionId, function(err, session) {
         // session.question(function(err, question){
              //if no questions go to next slide or not showing one
             // if(!question) {
        console.log('gotosub confirmed');
        ctrl.in(sessionId).emit('asq:gotosub', event);
        folo.in(sessionId).emit('asq:gotosub', event);
        session.activeSubstep = event.substepIndex;
        session.save(function(err) {
            if (err) { throw err; }
        });
            //  }
         // });
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
      if (!session) { return; }
      if (session.showingQuestion || session.showingAnswer) {
        session.question(function(err, question) {
          if (! question) {
            socket.emit('asq:goto', { slide: session.activeSlide });
            return;
          }
          question.displayQuestion(session.showingAnswer,
            function(err, displayQuestion) {
              socket.emit(session.showingAnswer ? 'asq:answer' : 'asq:question',
                         { question: displayQuestion });
          });
        });

      } else {
          socket.emit('asq:goto', {slide: session.activeSlide});
      }
    });
  }

  var ctrl = io.of('/ctrl')
  .authorization(authentication.ctrlAuthorize);

    /* Folo namespace for followers without control on the session.
	 * Authetification allows anyone without checking for credentials.
	 * It is used as a hack to limit the numbers of clients.
	 */
	var folo = io.of('/folo').authorization(authentication.liveAuthorize);

  // .authorization(function(handshakeData, callback) {
  //   //Limit number of sockets connection in folo to clientsLimit
  //   //(Global var defined in app.js, second arg passed when running the server)
  //   callback(null, io.of('/folo').clients().length < clientsLimit);
  // });

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
      console.log('new admin');
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

    /**
       @ function Handle gotosub event.
       When a gotosub event from an admin is sent, update status of current slide substep
       and informs all viewers of the new current slide substep
       @todo Implement authentification to make sure the event comes from a
       valid admin.
     */
    socket.on('asq:gotosub', function(event) {
      gotosub(event, socket.id);
    });
        
    //go to next slide even if there is a question
    //(unused for now)
    socket.on('asq:goto-force', function(event) {
      var sessionId = getSession(socket.id);
      if (!sessionId) { return; }
      Session.findById(sessionId, function(err, session) {
        ctrl.in(sessionId).emit('asq:goto', event);
        folo.in(sessionId).emit('asq:goto', event);
        session.activeSlide = event.slide;
        session.save(function(err) {
          if (err) { throw err; }
        });
      });
    });

		/*
		 * Event which handles the begining of a session (hides welcome popup)
		 */
    socket.on('asq:start', function(event) {
      var sessionId = getSession(socket.id);
      if (!sessionId) { return; }
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
      if (!sessionId) { return; }
      Session.findById(sessionId, function(err, session) {
        if (!session.showingQuestion) { return; }
        session.question(function(err, question) {
          question.displayQuestion(true, function(err, displayQuestion) {
            registration.getStats(question._id, sessionId, function(err, stats) {
              if(err) throw err;
              console.log(stats);
              console.log('answer event');
              ctrl.in(sessionId).emit('asq:answer', {
                question : displayQuestion,
                stats    : stats
              });
              folo.in(sessionId).emit('asq:answer', { question: displayQuestion });
              session.showingQuestion = false;
              session.showingAnswer = true;
              session.save(function(err) {
                  if (err) { throw err; }
              });
            });
          });
        });
      });
    });
      
    socket.on('asq:terminate-session', function(event) { 
      var sessionId = getSession(socket.id);

      if (!sessionId) { return; }
      Session.findById(sessionId, function(err, session) {
        if (err) { throw err; }
        
        if(!session) { 
          throw new Error("asq:terminate-session: Couldnd find session");
        }

        User.findByIdAndUpdate(session.presenter, { current : null },
          function(err, user) {
            if (err) { throw err; }
            console.log("I will terminate")
            folo.in(sessionId).emit('asq:session-terminated');
            ctrl.in(sessionId).emit('asq:session-terminated');
        });          
      })
    });

    socket.on('disconnect', function(event) { 
      console.log("Presenter disconnected")
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
        //if viewer add user to sessions. There are also invisible users

        function joinSocket(session){
          socket.join(event.session);
          if (session.started) { //query database
              socket.emit('asq:start', {});
          }
          update(socket);
        }

        if(event.mode && event.mode == 'viewer') {
          Session.findByIdAndUpdate(event.session, { $push: { viewers : nickname }},
            function(err, session) {
              if (session) {
                socket.set('nickname', nickname);
                console.log('Set user nickname: ' + nickname);
                nickname++; //nickname is just an increasing counter 
                joinSocket(session);
                ctrl.in(event.session).emit('asq:viewers-update', {
                  users : session.viewers.length
                }); 
              }
          });
        }else{
            Session.findById(event.session, function (err,session){
                if (session) {
                    joinSocket(session)
                }
            });   
        }
      });

      /*
       * Handle submission of data to a question from socket in the folo
       * namespace.
       */
      socket.on('asq:submit', function(event) {
        // console.log(event.answers)
        var sessionId = getSession(socket.id)
        , currentSession = undefined
        , user = undefined;

        if (!sessionId || !event.questionId) { return; }

        socket.get('nickname', function(err, nickname) {
          if (err) { throw err; }
          user = nickname || 'unknown';
          
          //get current session
          Session.findById(sessionId).exec()

            //find if answer if for a question in current slide
            .then(
              function(session) {
                currentSession = session;
                return currentSession.isQuestionInSlide(currentSession.activeSlide, event.questionId)                
            })

            //check if we already have an answer for this question in this session
            .then(
              function(isQuestionInSlide){
                if(! isQuestionInSlide) return; 
                
                return Answer.findOne(
                  {
                    _id       : {$in: currentSession.answers},
                    answeree  : user,
                    question : event.questionId
                  }
              ).exec();
            })

            // if we don't have an answer create a new one,
            // otherwise update it
            .then(
              function(answer){
                var deferred = when.defer();

                if (answer === null) {
                  // console.log("will create new answer")
                  answer = new Answer();
                  answer.question = event.questionId;
                  answer.answeree = user;
                  answer.submission = event.answers;
                  answer.session = currentSession.id;
                  currentSession.answers.push(answer._id);//add new answerSchema ref to session
                  currentSession.save(function(err, session){
                    if (err){
                       deferred.reject(err);
                    }
                    deferred.resolve(true);
                  });

                } else {
                  //resolve deferred since session doesn't need saving
                  deferred.resolve(true);
                  // console.log("already have an answer")
                  answer.submission = event.answers;
                }

                // save new answer
                return when.all([
                  answer.saveWithPromise(),
                  deferred.promise
                ]);
                //return answer.saveWithPromise();
            })

            //find all answers for the current question in the current
            //session and return promise
            .then(
              function(docs){
                return Answer.find({
                  _id: { $in : currentSession.answers },
                  question : event.questionId
                }).exec();
            })

            //Notify ctrl of participation
            .then(
              function(answers){
                ctrl.in(sessionId).emit('asq:submit', {
                  submitted  : answers.length,
                  questionId : event.questionId,
                  users      : currentSession.viewers.length
                });
              },
              function(err){ console.log(err); }
            );
        });
      });

      /**
       *  Just indicates that someone will resubmit an answer,
       *  compute the number of submitted answers and notifie ctrl
       */
      socket.on('asq:resubmit', function(event){
        console.log('ASQ received resubmmit');
        var sessionId = getSession(socket.id);
        if (!sessionId || !event.questionId) { return; }
        socket.get('nickname', function(err, nickname) {
          if (err) { throw err; }
          if (!nickname) { return; }
          console.log('from ' + nickname);
          Session.findById(sessionId, function(err, session) {
            session.question(function(err, question) {
              //Not accepting submissions for questions other than current one.
              if (!question || question._id.toString() !== event.questionId)  {return; }
              Answer.findOne({
                _id      : { $in:session.answers },
                question : event.questionId
              }, function(err, answer) {
                  if (err) { throw err; }
                  if (!answer) { return; }
                  var submitted = 0;
                  for (var i = 0; i < answer.answers.length; i++) {
                    if (answer.answers[i].user === String(nickname)) {
                        answer.answers[i].final = false;

                    } else if (answer.answers[i].final) { submitted++; }
                  }

                  //Notifes ctrl of participation
                  ctrl.in(sessionId).emit('asq:submit', {
                    submitted : submitted,
                    users     : session.viewers.length
                  });
                  answer.save(function(err){
                      if(err) { throw err; }
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
      if (!sessionId) { return; }
      socket.get('nickname', function(err, nickname) {
        Session.findByIdAndUpdate(sessionId, { $pop: { viewers : nickname }},
          function(err, session) {
            ctrl.in(sessionId).emit('asq:viewers-update',
              { users : session.viewers.length });
        });
      });
    });
  });
  
  return io;
}
