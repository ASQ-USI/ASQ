/** @module lib/socket
    @description socket utilities
*/
require('when/monitor/console');

var _            = require('lodash')
, when           = require('when')
, wkeys          = require('when/keys')
, arrayEqual     = require('./stats').arrayEqual
, logger         = require('../logger').socLogger
, submission     = require('../submission')
, Answer         = db.model('Answer')
, Assessment     = db.model('Assessment')
, Question       = db.model('Question')
, Session        = db.model('Session')
, User           = db.model('User')
, WhitelistEntry = db.model('WhitelistEntry');


var getToken = function(socket, callback) {
  var deferred = when.defer();

  socket.get('token', function(err, token) {
    if (callback && typeof callback === 'function') {
      callback(err, token);
    } else if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(token);
    }
  });

  return deferred.promise;
};


/*
 *  Get the dislayName stored with a socket.
 *  This function was rewritten to support a promise.
 */
var getTokenAndScreenName = function(socket, callback) {
  var deferred = when.defer();
  var returnData = {};

  getToken(socket).then(
    function onToken(token) {
      if (!token) {
        return when.reject(new Error('Unable to retrieve token.'));
      }
      returnData.token = token;
      return when.join(
        WhitelistEntry.findOne({ token : token }, 'screenName').exec(),
        token
      );
    })
  .then(
    function onEntry(data) {
      var entry = data[0];
      var token = data[1];
      if (!entry || !entry.screenName) {
        return when.reject(new Error('Screen name not found for ' + token + '.'));
      }
      returnData.screenName = entry.screenName;
      if (callback && typeof callback === 'function') {
        callback(null, returnData);
      } else {
        deferred.resolve(returnData);
      }
      return when.resolve(true); // Don't trigger the next onReject listener.
    })
  .catch(
    function onError(err) {
      if (callback && typeof callback === 'function') {
        callback(err, null);
        return;
      } else {
        deferred.reject(err);
      }
    });
  return deferred.promise;
};

var getSessionId = function(socket, callback) {
  var deferred = when.defer();
  socket.get('sessionId', function(err, sid) {
    if (callback && typeof callback === 'function') {
      callback(err, sid);
    } else if (err) {
      deferred.reject(err);
    } else {
      deferred.resolve(sid);
    }
  });
  return deferred.promise;
};

/*
 *  Get the session from a socket.
 */
var getSession = function(socket, callback) {
  var deferred = when.defer();

  getSessionId(socket).then(
    function retrieveSession(sid) {
      return Session.findById(sid).exec();
    }).then(
    function returnSession(session) {
      if (callback && typeof callback === 'function') {
        return callback(null,  session);
      } else {
        deferred.resolve(session);
      }
    }, function onError(err) {
      logger.error('Error on retrieving session:\n\t' + err.toString());
      if (callback && typeof callback === 'function') {
        return (err, null);
      } else {
        deferred.reject(err);
      }
    });

  return deferred.promise;
};

function getStats(questionIds, sessionId) {
  var deferred = when.defer();
  Question.find({_id: {$in: questionIds }}).exec()
  .then(
    function onQuestions(questions) {
      if (! questions) {
        deferred.resolve(null); //No questions means no stats
      }
      var o = {};
      for (var i = questions.length; i--;) {
        o[questions[i]._id] = questions[i].getStats(sessionId);
      }
      return wkeys.all(o);
  }).then(
    function onStats(stats) {
      deferred.resolve(stats);
  },function onError(err) {
      deferred.reject(err);
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
};

/*
 *  Emit an event to the ctrl, folo & wtap namespaces to go to a specific slide.
 */
var goto = function(io, socket, evt) {
  var sessionId      = null
    , currentSession = null;

  getSession(socket)
    .then(function(session){
      sessionId      = session._id;
      currentSession = session;
      return when.all([
        currentSession.questionsForSlide(evt.slide),
        currentSession.statQuestionsForSlide(evt.slide)
      ]);
    })
    .then(function(results) {

      currentSession.activeSlide = evt.slide;
      currentSession.activeQuestions = results[0];
      currentSession.activeStatsQuestions = results[1];

      if (!! currentSession.activeStatsQuestions.length) {
       return getStats(currentSession.activeStatsQuestions, currentSession._id);
      }
      return when.resolve(null);
    })
    .then(
      function onStats(stats) {
        if (!! stats) {
          evt.stats = stats;
        }
        notifyNamespaces('asq:goto', evt, io, sessionId, 'ctrl', 'folo', 'wtap');

        // save changes to the session
        currentSession.save(function(err) {
          if (err) { throw err; }
        });
    }, function onError(err) {
      logger.error('On goto: ' + err.message, {err: err.stack});
    });
};

var gotosub = function(io, socket, evt) {
  getSession(socket, function(err, session){
    if (err) {
      throw err;
    }
    notifyNamespaces('asq:gotosub', evt, io, session._id, 'ctrl', 'folo', 'wtap');
    session.activeSubstep = evt.substepIndex;
    session.save(function(err) {
      if (err) { throw err; }
    });
  });

};

var submit = function(io, socket, evt) {
  var data;
  logger.debug('Submission');
  logger.debug(data);
  when.all([
    getSession(socket),                  //SessionId
    getToken(socket),                        //Socket unique token
    Question.findById(evt.questionId).exec() //Question
  ])
  .then(
    function updateAnswer(info) {
      data = info;

      //FIXME : screenName questions without solution better
      var score = 100;
      var solution = data[2].getSolution();
        logger.debug('YABAADA', solution);
      if(solution){
        score = arrayEqual(evt.answers, data[2].getSolution()) ? 100 : 0;
      }
      logger.info('Confidence ' + evt.confidence);
      logger.info(evt);
      return Answer.findOneAndUpdate({
        session  : data[0]._id,    //SessionId
        answeree : data[1],    //Socket (user) name
        question : data[2]._id //_id attr. of question
      }, {
        submission  : evt.answers,
        correctness : score,
        confidence  : (!evt.confidence || evt.confidence < 1 || evt.confidence > 5) ? 0 : evt.confidence //This is bad should separate find and update...
      }, { upsert : true // Create the answer if it does not exist
                         // This allow for resubmission.
                         // (needs to be changed for peer assessment)
      }).exec();
    })
  .then(
    function countAnswers(answer){
      return Answer.count({question : data[2]._id}).exec();
    })
  .then(
    function notifySubmitted(submittedAnswers) {
      var clients = io.of('/folo').clients(data[0].id).length;
      var resEvent = { submittedViewers: submittedAnswers,
                       totalViewers: clients,
                       questionId : evt.questionId };
      logger.debug(resEvent);
      socket.emit('asq:submitted', resEvent);
      notifyNamespaces('asq:submitted', resEvent, io, data[0]._id, 'ctrl');
    },
    function(err) {
      logger.error(err);
      throw err;
    });
};

var submit2 = function(io, socket, evt) {
  logger.debug('Submission');
  // Notify the sender
  socket.emit('asq:submitted', {
    exercise : evt.exercise.id,
    status   : 'processing'
  });
  when.all([
    getSession(socket),
    getToken(socket),
  ]).then(
    function onData(data) {
      return submission.answer.save(data[0], data[1], evt.exercise);
  }).then(
    function handleAssessment(data) {
      var exercise  = data[0];
      var questions = data[1];
      var answers   = data[2];
      var progress  = data[3];
      var self      = data[4];
      var peer      = data[5];

      // Add audience size to progress.
      progress['audience'] = io.of('/folo').clients(progress.session).length;

      // Send updated progress to ctrl
      notifyNamespaces('asq:submitted', { progress: progress }, io,
        progress.session, 'ctrl');

      socket.emit('asq:submitted', {
        exercise : exercise.id,
        resubmit : exercise.allowResubmit,
        status   : 'success'
      });

      // Handle peer assessment
      if (peer) { // Add answers for peers

        if (! self) { // Go straight to peer-assessment

        }
      }
      console.log('Self assessment:', self)

      // Handle self assessment
      if (self) {
        var i = questions.length;
        while(i--) {
          var question = questions[i];
          var answer = answers[question._id.toString()]; // not bson -> no id getter
          question.confidence = answer.confidence;
          question.submission = answer.submission;
        }
        exercise.questions = questions;
        return submission.assessment.renderAssessment([exercise]);
      }
    }).then(
      function sendFirstAssessment(html) {
        if (! html) { // No assessment

        } else {
          socket.emit('asq:assess', { html: html, exercise: evt.exercise.id });
        }
    }).then(null,
    function onError(err) {
      console.error(err);
    });
}

// var foloAssess = function(io, socket, evt) {
//   getSessionId(socket).then(
//     function findAssessment(sessionId) {
//       return Assessment.findOne({ _id: evt.id, session: sessionId }).exec();
//     }).then(
//     function updateAssessment(assessment) {
//       assessment.score = evt.score;
//       assessment.save().exec();
//     }).then(
//     function nextAssessment(assessment) {
//       return null; // Select next assessment to send.
//     }
//     );
// };

var terminate = function(io, socket, evt) {
  var sessionId = null;

  getSessionId(socket).then(
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
};

function deleteAndNotify(io, socket, data, namespace, toNotify) {
  var args       = Array.prototype.slice.call(arguments, 4);
  var sessionId  = data[0];
  var screenName = data[1].screenName;
  var eventName  = 'asq:' + namespace + '-disconnected';
  var evt        = { screenName : screenName };

  socket.del('token', function onDelToken(err, data) {
    if (err) {
      logger.error('Failed to remove ' + data + ' (token) on disconnect (' + screenName +')');
    } else {
    logger.info('Removed ' + data + ' (token) on disconnect (' + screenName +')');
    }
  });

  socket.del('sessionId', function onDelToken(err, data) {
    if (err) {
      logger.error('Failed to remove ' + data + ' (token) on disconnect (' + screenName +')');
    } else {
    logger.info('Removed ' + data + ' (session id) on disconnect (' + screenName +')');
    }
  });

  socket.leave(sessionId);
  delete socket;
  notifyNamespaces(eventName, evt, io, sessionId, args);
  logger.info('[' + namespace.toUpperCase() + '] ' +
    screenName + ' disconnected');
}

var ioConnect = function(io, socket, namespace) {
  var session = socket.handshake.session;
  socket.set('sessionId', session._id); //easier to retrieve.
  socket.set('token', socket.handshake.token);
  socket.join(session._id);

  var evt = { slide: session.activeSlide };
  if (!! session.activeStatsQuestions.length) {
    getStats(session.activeStatsQuestions, session._id)
    .then(
      function onStats(stats) {
        if (!! stats) {
          evt.stats = stats;
        }
        socket.emit('asq:goto', evt);
        logger.info('[' + namespace.toUpperCase() + '] ' +
          socket.handshake.screenName + ' connected');
    })
  } else {
    socket.emit('asq:goto', evt);
    logger.info('[' + namespace.toUpperCase() + '] ' +
      socket.handshake.screenName + ' connected');
  }
};

var ctrlConnect = function(io, socket) {
  var screenName = socket.handshake.screenName;
  var sessionId = socket.handshake.session._id;
  var evt       = { screenName : screenName };
  var session   = socket.handshake.session;

  ioConnect(io, socket, 'ctrl');
  notifyNamespaces('asq:ctrl-connected', evt, io, sessionId,
      'ctrl', 'wtap', 'folo');
};

var ctrlDisconnect = function(io, socket) {
  logger.info('CTRL Disconnect');
  when.all([
    getSessionId(socket),
    getTokenAndScreenName(socket)
  ]).then(
  function delAndNotify(data) {
    deleteAndNotify(io, socket, data, 'ctrl', 'ctrl', 'folo', 'wtap');
  },
  function ctrlDisconnectErr(err) {
    logger.error('Failed to disconnect client from \'ctrl\':\n\t' +
      err.toString(), { err: err.stack });
  });
};

var foloConnect = function(io, socket) {
  var screenName = socket.handshake.screenName;
  var sessionId = socket.handshake.session._id;

  ioConnect(io, socket, 'folo');

  var clients = io.of('/folo').clients(sessionId).length;
  var evt = {connectedClients: clients, screenName : screenName };

  notifyNamespaces('asq:folo-connected', evt, io, sessionId,
      'ctrl', 'wtap', 'folo');
};

var foloDisconnect = function(io, socket) {
  when.all([
    getSessionId(socket),
    getTokenAndScreenName(socket)
  ]).then(
  function delAndNotify(data) {
    deleteAndNotify(io, socket, data, 'folo', 'ctrl', 'folo', 'wtap');
  },
  function foloDisconnectErr(err) {
    logger.error('Failed to disconnect client from \'folo\':\n\t' +
      err.toString(), { err: err.stack });
  });
};

var wtapConnect = function(io, socket) {
  ioConnect(io, socket, 'wtap');
};

var wtapDisconnect = function(io, socket) {
  getSessionId(socket).then(
  function handleDisconnect(sessionId) {
    deleteAndNotify(io, socket, [sessionId, 'Wtap client'], 'wtap', 'ctrl');
  },
  function wtapDisconnectErr(err) {
    logger.error('Failed to disconnect client from \'wtap\':\n\t' +
      err.toString());
  });
};

var statConnect = function(io, socket) {
  ioConnect(io, socket, 'stat');
};

var statDisconnect = function(io, socket) {
  getSessionId(socket).then(
  function handleDisconnect(sessionId) {
    deleteAndNotify(io, socket, [sessionId, 'Stat client'], 'stat', 'ctrl');
  },
  function wtapDisconnectErr(err) {
    logger.error('Failed to disconnect client from \'stat\':\n\t' +
      err.toString());
  });
};

module.exports = {
  goto           : goto,
  gotosub        : gotosub,
  submit         : submit2,
  ctrlConnect    : ctrlConnect,
  ctrlDisconnect : ctrlDisconnect,
  foloConnect    : foloConnect,
  foloDisconnect : foloDisconnect,
  wtapConnect    : wtapConnect,
  wtapDisconnect : wtapDisconnect,
  statConnect    : statConnect,
  statDisconnect : statDisconnect,
  terminate      : terminate
};