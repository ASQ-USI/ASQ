/** @module lib/socket
    @description socket utilities
*/
require('when/monitor/console');


var _            = require('lodash')
, when           = require('when')
, wkeys          = require('when/keys')
, nodefn         = require('when/node/function')
, arrayEqual     = require('./stats').arrayEqual
, logger         = require('../logger').socLogger
, assessment     = require('../assessment')
, submission     = require('../submission')
, Answer         = db.model('Answer')
, AnswerProgress = db.model('AnswerProgress')
, Assessment     = db.model('Assessment')
, AssessmentJob  = db.model('AssessmentJob')
, Exercise       = db.model('Exercise')
, Question       = db.model('Question')
, Session        = db.model('Session')
, User           = db.model('User')
, WhitelistEntry = db.model('WhitelistEntry');

module.exports =  function(io, client){
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
          WhitelistEntry.findOne({ _id : token }, 'screenName').exec(),
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

  var notifyNamespaces = function(eventName, evt, sessionId, namespaces) {
    if (arguments.length < 4) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 3);
    for (var i=0; i<args.length; i++) {
      io.of('/' + args[i]).in(sessionId).emit(eventName, evt);
    }
  };

  /*
   *  Emit an event to the ctrl, folo & wtap namespaces to go to a specific slide.
   */
  var goto = function(socket, evt) {
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
          notifyNamespaces('asq:goto', evt, sessionId, 'ctrl', 'folo', 'wtap');

          // save changes to the session
          currentSession.save(function(err) {
            if (err) { throw err; }
          });
      })
      .then(null,
        function onError(err) {
        logger.error('On goto: ' + err.message, {err: err.stack});
      });
  };

  var gotosub = function(socket, evt) {
    getSession(socket, function(err, session){
      if (err) {
        throw err;
      }
      notifyNamespaces('asq:gotosub', evt, session._id, 'ctrl', 'folo', 'wtap');
      session.activeSubstep = evt.substepIndex;
      session.save(function(err) {
        if (err) { throw err; }
      });
    });

  };

  var submit = function(socket, evt) {
    var token = null;
    var exercise = null;
    var session = null;
    var newJob = null;
    var newJobs = null;
    logger.debug('Submission');
    if (!evt.exercise || !evt.exercise.id) {
      logger.error(new Error('Invalid Submission: Missing or invalid exercise.'));
      return;
    }
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
        session = data[0];
        token = data[1];
        return submission.answer.save(data[0], data[1], evt.exercise);
    }).then(
      function handleAssessment(data) {
            exercise  = data[0];
        var questions = data[1];
        var answers   = data[2];
        var progress  = data[3];
        var self      = data[4];
        var peer      = data[5];

        sendProgress(progress, session.id);

        socket.emit('asq:submitted', {
          exercise : exercise.id,
          resubmit : exercise.allowResubmit,
          status   : 'success',
          type     : 'answer'
        });

        // Handle peer assessment
        if (self || peer) { // Add answers for peers
          // in the case of assessment -> add the answer to the queue
          return enqueueAnswersForAssessment(session._id, exercise, answers, token);
        } else {
          return when.resolve(null);
        }
      }).then(
        function getJob(jobs) {
          return assessment.job.getNextAssessmentJob(session._id, exercise, token);
      }).then(
        function activateJob(job) {
          newJob = job;
          return assessment.job.activateJob(job);
      }).then(
        function renderJob(job) {
          return assessment.render(job);
      }).then(
        function sendFirstAssessmentAndGetIdleJobs(html) {
          if (!! html) {
            logger.info('Sending assessment to ' + socket.id);
            socket.emit('asq:assess', { html: html, exercise: exercise.id });
          }
         
          // notify ctrl of the assessment
          notifyCtrlForNewJobs([newJob]);

          return assessment.job.getNextJobForIdleViewers(session._id, exercise);  
      }).then(
        function getIdleSockets(jobs) {
          newJobs = jobs
          return getSocketsForJobs(jobs);
      }).then(
        function activateJobs(JobSocketsPairs) {
          return activateJobsForSockets(JobSocketsPairs);
      }).then(
        function renderJobs(JobSocketsPairs) {
          return renderJobsForSockets(JobSocketsPairs);
      }).then(
        function sendJobs(HtmlSocketsPairs) {
          sendHtmlForSockets(HtmlSocketsPairs, exercise.id);
          console.log("I SHOULDA")
          notifyCtrlForNewJobs( newJobs);
          return true;
      }).then(null,
      function onError(err) {
        logger.error(err.message, { err: err.stack });
      });
  }

  var assessed = function(socket, evt) {
    var savedAssessments;
    logger.debug('Assessment');
    if (!evt.assessment) {
      logger.error(new Error('Invalid Submission: Missing or invalid exercise.'));
      return;
    }
    if (!evt.assessment.exercise) {
      logger.error(new Error('Invalid or missing exercise reference.'));
    }
    var session  = null;
    var assessor = null;
    var exercise = null;
    var assessee = evt.assessment.assessee;
    when.all([
      getSession(socket),
      getToken(socket),
      Exercise.findById(evt.assessment.exercise).exec(),
    ]).then(
      function onData(data) {
        session  = data[0];
        assessor = data[1];
        exercise = data[2];
        return assessment.save(session, evt.assessment, assessor);
    }).then(
      function termninateJobs(assessments) {
        savedAssessments = assessments;
        return assessment.job
          .terminateJobsAndUpdateProgress(session, exercise._id, assessor, assessee);
    }).then(
      function nextAssessment(progress) {
        progress = progress.toObject(); // Convert to object to add audience.
         // Add audience size to progress.
        progress.audience = io.of('/folo').clients(progress.session).length;

        var score=0;
        for (var i = savedAssessments.length - 1; i >= 0; i--) {
          score += savedAssessments[i].score;
        };

        score = ~~(score/savedAssessments.length);

        //notify ctrl for the assessment
        var assessEvt={
          exerciseId : exercise._id,
          assessor: {token: assessor},
          assessee: {token: assessee},
          score: score
        }
        notifyNamespaces('asq:assess', assessEvt, session._id, 'ctrl');
        console.log('score', score);

        // Send updated progress to ctrl
        notifyNamespaces('asq:submitted', { progress: progress },
          progress.session, 'ctrl');

        socket.emit('asq:submitted', {
          exercise : exercise.id,
          resubmit : false,
          status   : 'success',
          type     : 'assessment'
        });

        return assessment.job.getNextAssessmentJob(progress.session, exercise, assessor);
    }).then(
      function renderAssessment(job) {
        // notify ctrl of the assessment
        var jobEvt = {
            exerciseId: exercise._id,
            assessor: {token:job.assessor},
            assessee: {token:job.assessee}
          };

        notifyNamespaces('asq:new-assessment-job', jobEvt, session._id, 'ctrl');
        return assessment.render(job);
    }).then(
      function sendAssement(html) {
        if (html) {
          socket.emit('asq:assess', { html: html, exercise: exercise.id });
        }
    }).then(null,
      function onError(err) {
        logger.error(err.message, { err: err.stack });
      });
  }

  var terminate = function(socket, evt) {
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
        notifyNamespaces('asq:session-terminated', {}, sessionId,
          'ctrl', 'folo', 'wtap', 'stat');
      }, function onError(err) {
        logger.error('Error on terminate session:\n\t' + err.toString());
      });
  };

  function deleteAndNotify(socket, data, namespace, toNotify) {
    var args       = Array.prototype.slice.call(arguments, 3);
    var sessionId  = data[0];
    var screenName = data[1].screenName;
    var eventName  = 'asq:' + namespace + '-disconnected';
    var evt        = { screenName : screenName };

    socket.del('token', function onDelToken(err, data) {
      if (err) {
        logger.error('Failed to remove ' + screenName +
          ' (token) on disconnect (' + screenName +')');
      } else {
      logger.info('Removed ' + screenName + ' (token) on disconnect (' +
        screenName +')');
      }
    });

    socket.del('sessionId', function onDelToken(err, data) {
      if (err) {
        logger.error('Failed to remove ' + sessionId +
          ' (sessionId) on disconnect (' + screenName +')');
      } else {
      logger.info('Removed ' + sessionId + ' (session id) on disconnect (' +
        screenName +')');
      }
    });

    socket.leave(sessionId);
    delete socket;
    notifyNamespaces(eventName, evt, sessionId, args);
    logger.info('[' + namespace.toUpperCase() + '] ' +
      screenName + ' disconnected');
    return when.resolve(data);
  }

  var ioConnect = function(socket, namespace) {
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

  var ctrlConnect = function(socket) {
    var screenName = socket.handshake.screenName;
    var sessionId = socket.handshake.session._id;
    var evt       = { screenName : screenName };
    var session   = socket.handshake.session;

    ioConnect(socket, 'ctrl');
    notifyNamespaces('asq:ctrl-connected', evt, sessionId,
        'ctrl', 'wtap', 'folo');

    // TODO: check if sendConnectedClients call is needed
    //sendConnectedClients(sessionId, null, null, 'ctrl');
    sendProgresses(sessionId);
  };

  var ctrlDisconnect = function(socket) {
    logger.info('CTRL Disconnect');
    when.all([
      getSessionId(socket),
      getTokenAndScreenName(socket)
    ]).then(
    function delAndNotify(data) {
      return deleteAndNotify(socket, data, 'ctrl', 'ctrl', 'folo', 'wtap');
    },
    function ctrlDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'ctrl\':\n\t' +
        err.toString(), { err: err.stack });
    });
  };

  var foloConnect = function(socket) {
    var screenName = socket.handshake.screenName;
    var sessionId  = socket.handshake.session._id;
    var token      = socket.handshake.token;

    ioConnect(socket, 'folo');
    sendConnectedClients(sessionId, token, screenName, 'ctrl', 'wtap', 'folo');

    return nodefn.call(client.lpush.bind(client), token, socket.id).then(
      function onPush() {
        logger.info('[Redis] saved socket id');
        return submission.progress.updateConnect(sessionId, token);
    }).then(
      function notifyProgress(progresses) {
        return sendProgresses(sessionId); //Return updates to progress bars to ctrl on folo conn.
    }).then(function completeAnswers(progresses) {
      return sendSubmissions(socket, sessionId, token);
    }).then(function getActiveJob(session) {
      return AssessmentJob.find({
        assessor : token,
        status   : 'active',
        session  : sessionId,
      }).exec();
    }).then(function getExercises(jobs) {
      var exerciseIds = jobs.map(function(job) { return job.exercise });
      return when.join(jobs, Answer.distinct('exercise', {
        answeree : token,
        session  : sessionId,
        exercise : {$nin: exerciseIds }
      }).exec());
    }).then(
      function getExercises(data) {
        var jobs = data[0];
        var exerciseIds = data[1];
        return when.join(jobs,
          Exercise.find({ _id: {$in: exerciseIds} }).exec());
    }).then(
      function getNextJobs(data) {
        var jobs = data[0];
        var exercises = data[1];
        return when.join(jobs, when.map(exercises, function getNextJob(ex) {
          return assessment.job.getNextAssessmentJob(sessionId, ex, token);
        }));
    }).then(
      function activateIdleJobs(jobs) {
        jobs = _.remove(_.flatten(jobs), function(j) { return j !== null});
        notifyCtrlForNewJobs(jobs);
        return when.map(jobs,
          function(j) { return assessment.job.activateJob(j); });
    }).then(
      function renderJobs(jobs) {
        return when.join(jobs,
          when.map(jobs, function(j) { return assessment.render(j); }));
    }).then(
      function sendHtmls(jobsAndHtml) {
        var jobs = jobsAndHtml[0];
        var htmls = jobsAndHtml[1];
        var i = Math.min(jobs.length, htmls.length);
        while(i--) {
          if (!! jobs[i] && !! htmls[i]) {
            socket.emit('asq:assess', {
              exercise : jobs[i]. exercise, html : htmls[i] });
          }
        }
    });
  };

  var foloDisconnect = function(socket) {
    when.all([
      getSessionId(socket),
      getTokenAndScreenName(socket)
    ]).then(
      function(data) {
        return nodefn.call(
          client.lrem.bind(client), data[1].token, 0, socket.id).then(
            function onRemove() {
              logger.info('[Redis] Removed socket id');
              return when.resolve(data); });
    }).then(
      function delAndNotify(data) {
      return deleteAndNotify(socket, data, 'folo', 'ctrl', 'folo', 'wtap');
    }).then(
    function updateProgresses(data) {
      return submission.progress.updateDisconnect(data[0], data[1].token);
    }).then(
    function notifyProgress(data) {
      var i = data.length, progress;
      while(i--) {
        progress = data[i].toObject();
        progress.audience = io.of('/folo').clients(progress.session).length;
        notifyNamespaces('asq:submitted', { progress: progress },
          progress.session, 'ctrl');
      }
    },
    function foloDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'folo\':\n\t' +
        err.toString(), { err: err.stack });
    });
  };

  var wtapConnect = function(socket) {
    ioConnect(socket, 'wtap');
  };

  var wtapDisconnect = function(socket) {
    getSessionId(socket).then(
    function handleDisconnect(sessionId) {
      return deleteAndNotify(socket, [sessionId, 'Wtap client'], 'wtap', 'ctrl');
    },
    function wtapDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'wtap\':\n\t' +
        err.toString());
    });
  };

  var statConnect = function(socket) {
    ioConnect(socket, 'stat');
  };

  var statDisconnect = function(socket) {
    getSessionId(socket).then(
    function handleDisconnect(sessionId) {
      deleteAndNotify(socket, [sessionId, 'Stat client'], 'stat', 'ctrl');
    },
    function wtapDisconnectErr(err) {
      logger.error('Failed to disconnect client from \'stat\':\n\t' +
        err.toString());
    });
  };

  var sendProgress = function(progress, sessionId) {
    // Convert mongoose document to object
    if (progress instanceof AnswerProgress) {
      progress = progress.toObject();
    }
    // Add audience size to progress.
    progress.audience = io.of('/folo').clients(sessionId).length;

    // Send updated progress to ctrl
    notifyNamespaces('asq:submitted', { progress: progress },
      progress.session, 'ctrl');

    var defer = when.defer()
    process.nextTick(function resolve() { defer.resolve(progress); });
    return defer.promise;
  }

  var sendProgresses = function(sessionId) {
    AnswerProgress.find({session: sessionId}).lean().exec().then(
      function onProgressess(progresses) {
        if(progresses instanceof Array) {
          return when.map(progresses, function handleProgress(progress) {
            return sendProgress(progress, sessionId)
          });
        }
        var defer = when.defer()
        process.nextTick(function resolve() { defer.resolve(null); });
        return defer.promise;
    });
  }

  var enqueueAnswersForAssessment = function(sessionId, exercise, answers, token) {
    return assessment.job.enqueue(sessionId, exercise,
      Object.keys(answers).map(function getAnswerDoc(i) {
        return answers[i];
    }));
  }

  var getSocketsForJobs = function(jobs) {
    var pairs = [];
    var i = jobs.length;
    while(i--){
      pairs.push(when.join(
        nodefn.call(client.lrange.bind(client), jobs[i].assessor, 0, -1),
        jobs[i])
      );
    }
    return when.all(pairs);
  }

  var activateJobsForSockets = function (JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.job.activateJob(pair[1]));
    });
  }

  var renderJobsForSockets = function(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.render(pair[1]));
    });
  }

  var sendHtmlForSockets = function(HtmlSocketsPairs, exerciseId) {
    var j, pair, html, sockets;
    var i = HtmlSocketsPairs.length;
    while(i--) {
      pair = HtmlSocketsPairs[i];
      sockets = pair[0];
      html = pair[1];
      if (!! html) {
        j = sockets.length;
        while(j--) {
          logger.info('Sending assessment to idle viewer ' + sockets[j])
          io.of('/folo').socket(sockets[j]).emit('asq:assess',
            { html: html, exercise : exerciseId });
        }
      }
    }
  }

  function notifyCtrlForNewJobs(newJobs){
     newJobs.forEach(function(newJob){
      var jobEvt = {
        exerciseId: newJob.exercise,
        assessor: {token:newJob.assessor},
        assessee: {token:newJob.assessee}
      };
      notifyNamespaces('asq:new-assessment-job', jobEvt, newJob.session, 'ctrl');
    });
  }
 

  var sendConnectedClients = function(sessionId, token, screenName, namespaces) {
    if (arguments.length < 3) { return; }

    var clients = io.of('/folo').clients(sessionId).length;
    var evt = { connectedClients: clients };
    if (_.isString(screenName)) {
      evt.screenName = screenName;
    }
    evt.token = token;

    var notifyBinded =  notifyNamespaces
      .bind(this, 'asq:folo-connected', evt, sessionId );
    notifyBinded.apply(this, Array.prototype.slice.call(arguments, 3));
  }

  var sendSubmissions = function(socket, sessionId, token) {
    var defer = when.defer();
    Answer.distinct('exercise', { session : sessionId, answeree : token })
      .exec().then(
        function onExercises(exercises) {
          if (! exercises) {
            defer.resolve(null);
          }
          var i = exercises.length;
          while(i--) {
            socket.emit('asq:submitted',
              { exercise : exercises[i], status: 'confirmation', type: 'answer' });
          }
          defer.resolve(exercises);
        }, function onError(err) { defer.reject(err); }
    );
    return defer.promise;
  }

  return {
    goto           : goto,
    gotosub        : gotosub,
    submit         : submit,
    foloAssess     : assessed,
    ctrlConnect    : ctrlConnect,
    ctrlDisconnect : ctrlDisconnect,
    foloConnect    : foloConnect,
    foloDisconnect : foloDisconnect,
    wtapConnect    : wtapConnect,
    wtapDisconnect : wtapDisconnect,
    statConnect    : statConnect,
    statDisconnect : statDisconnect,
    terminate      : terminate
  }
}
