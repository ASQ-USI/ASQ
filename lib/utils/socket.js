/** @module lib/socket
    @description socket utilities
*/

var when           = require('when')
  , arrayEqual     = require('./stats').arrayEqual
  , logger         = require('../logger').socLogger
  , Answer         = db.model('Answer')
  , Assessment     = db.model('Assessment')
  , Question       = db.model('Question')
  , Session        = db.model('Session')
  , User           = db.model('User')
  , WhitelistEntry = db.model('WhitelistEntry');


var getToken = function(socket, callback) {
  var deferred = when.defer();

  socket.get("token", function(err, token) {
    if (callback & (typeof(callback) == "function")) {
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
      returnData.token = token;
      return WhitelistEntry.findOne({ token : token }, 'screeName').exec()
    })
  .then(
    function onEntry(entry) {
      if (!entry || !entry.screenName) {
        return when.reject(new Error('Screen name not found.'));
      }
      returnData.screenName = entry.screenName;
      if (callback & (typeof(callback) == "function")) {
        callback(null, returnData);
      } else {
        deferred.resolve(returnData);
      }
      return when.resolve(true); // Don't trigger the next onReject listener.
    })
  .then(null,
    function onError(err) {
      if (callback & (typeof(callback) == "function")) {
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
    if (callback && typeof(callback) === 'function') {
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
};

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
      var activeQuestions      = results[0];
      var activeStatsQuestions = results[1];

      notifyNamespaces('asq:goto', evt, io, sessionId, 'ctrl', 'folo', 'wtap');

      currentSession.activeSlide = evt.slide;
      currentSession.activeQuestions = results[0];
      currentSession.activeStatsQuestions = results[1];

      //TODO: screenName stats

      // if (activeStatsQuestions) {
      //  for (var i=0; i < io.of('/folo').clients(sessionId).length; i++) {
      //    io.of('/folo').clients(sessionId)[i].get('screenName',
      //      function(err, name) {
      //        if (!err && name) {
      //          screenNames.push(name);
      //          if  (i === io.of('/folo').clients(sessionId).length - 1) {
      //            //send answers
      //          }
      //        }
      //      })
      //  }
      // }

      currentSession.save(function(err) {
        if (err) { throw err; }
      });

    }, function(err) {
      throw err;
    });

};

var gotosub = function(io, socket, evt) {
  getSession(io, socket, function(err, session){
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
  logger.debug("Submission");
  logger.debug(data);
  when.all([
    getSession(io, socket),                  //SessionId
    getToken(socket),                        //Socket unique token
    Question.findById(evt.questionId).exec() //Question
  ])
  .then(
    function updateAnswer(info) {
      data=info;

      //FIXME : screenName questions without solution better
      var score = 100;
      var solution = data[2].getSolution();
        logger.debug("YABAADA", solution);
      if(solution){
        score = arrayEqual(evt.answers, data[2].getSolution()) ? 100 : 0;
      }

      var answerUpdate =  Answer.findOneAndUpdate({
        session  : data[0]._id,    //SessionId
        answeree : data[1],    //Socket (user) name
        question : data[2]._id //_id attr. of question
      }, {
        submission  : evt.answers,
        correctness : score
      }, { upsert : true // Create the answer if it does not exist
                         // This allow for resubmission.
                         // (needs to be changed for peer assessment)
      }).exec();

      if (!evt.score || evt.score == -1) {
        logger.info('No self-confidence for question ' + evt.questionId);
        return when.resolve(null); //No score means no confidence.
      }
      logger.info('Looking for wle with ' + data[1]);
      var whiteListQuery = WhitelistEntry.findOne({ token: data[1] }).exec();

      return when.join(whiteListQuery, answerUpdate);
    })
  .then( // Generate self confidence
    function selfAssess(assessData) {
      if (assessData === null) {
        logger.info('No self-confidence data for question ' + evt.questionId);
        return when.resolve(null); //No score means no confidence.
      }
      logger.info('Assessment from ' + data[1] + ' score: ' + evt.score);
      return Assessment.findOneAndUpdate({
          answer   : assessData[1]._id,
          assessor : assessData[0].uid,
          assessee : assessData[0].uid,
          category : 'self',
          session  : data[0]._id
        }, { score : evt.score }, { upsert : true}).exec();
    })
  .then(
    function countAnswers(selfAssessment){
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

var foloAssess = function(io, socket, evt) {
  getSessionId(io, socket).then(
    function findAssessment(sessionId) {
      return Assessment.findOne({ _id: evt.id, session: sessionId }).exec();
    }).then(
    function updateAssessment(assessment) {
      assessment.score = evt.score;
      assessment.save().exec();
    }).then(
    function nextAssessment(assessment) {
      return null; // Select next assessment to send.
    }
    );
};

var terminate = function(io, socket, evt) {
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
};

function deleteAndNotify(io, socket, data, namespace, toNotify) {
  var args        = Array.prototype.slice.call(arguments, 4);
  var sessionId   = data[0];
  var screenName = data[1].screenName;
  var eventName   = 'asq:' + namespace + '-disconnected';
  var evt         = { screenName : screenName };

  delete socket;
  notifyNamespaces(eventName, evt, io, sessionId, args);
  logger.info('[' + namespace.toUpperCase() + '] ' +
    screenName + " disconnected");
}

var ioConnect = function(io, socket, namespace, clientName) {
  socket.set('sessionId', socket.handshake.session._id); //easier to retrieve.
  socket.join(socket.handshake.session._id);
  socket.emit('asq:goto', { slide: socket.handshake.session.activeSlide });
  logger.info('[' + namespace.toUpperCase() + '] ' + clientName + " connected");
};

var ctrlConnect = function(io, socket) {
  var token     = socket.handshake.token;
  var screenName = socket.handshake.screenName;
  var sessionId = socket.handshake.session._id;
  var evt       = { screenName : screenName };

  socket.set('token', token);
  ioConnect(io, socket, 'ctrl', screenName);
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
  var token     = socket.handshake.token;
  var screenName = socket.handshake.screenName;
  var sessionId = socket.handshake.session._id;

  socket.set('token', token);
  ioConnect(io, socket, 'folo', screenName);

  var clients = io.of('/folo').clients(sessionId).length;
  var evt = {connectedClients: clients, name : screenName }; //TODO name is undef -> need to fix and evt should have screenName not name also on client

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
  ioConnect(io, socket, 'wtap', 'Wtap client');
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
  ioConnect(io, socket, 'stat', 'Stat client');
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
  submit         : submit,
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