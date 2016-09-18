/** @module lib/socket/utils
 @description socket utilities
 */
require('when/monitor/console');


var _ = require('lodash');
var when = require('when');
var gen = require('when/generator');
var wkeys = require('when/keys');
var nodefn = require('when/node/function');
var arrayEqual = require('../stats').arrayEqual;
var logger = require('logger-asq');
var flow = require('../flow');
var assessment = require('../assessment');
var Answer = db.model('Answer');
var AnswerProgress = db.model('AnswerProgress');
var Assessment = db.model('Assessment');
var AssessmentJob = db.model('AssessmentJob');
var Exercise = db.model('Exercise');
var Question = db.model('Question');
var Session = db.model('Session');
var User = db.model('User');
var WhitelistEntry = db.model('WhitelistEntry');
var Promise = require("bluebird");

module.exports = function (io, client, socketPubSub) {

  /**
   *  Get the dislayName stored with a socket.
   *  This function was rewritten to support a promise.
   */
  var getTokenAndScreenName = gen.lift(function *getTokenAndScreenName(socket, callback) {
    var returnData = {};
    try {
      var token = socket.request.token;
      if (!token) {
        return when.reject(new Error('Unable to retrieve token.'));
      }
      returnData.token = token;

      var entry = yield WhitelistEntry.findOne({_id: token}, 'screenName').exec();
      if (!entry || !entry.screenName) {
        throw (new Error('Screen name not found for ' + token + '.'));
      }

      returnData.screenName = entry.screenName;
    } catch (err) {
      if (callback && typeof callback === 'function') {
        callback(err, null);
        return;
      } else {
        return when.reject(err);
      }
    }

    if (callback && typeof callback === 'function') {
      callback(null, returnData);
    }
    return returnData;
  });

  var emitToRoles = function (eventName, evt, sessionId, namespaces) {
    if (arguments.length < 4) {
      return;
    }
    var args = Array.prototype.slice.call(arguments, 3);
    for (var i = 0; i < args.length; i++) {
      io.of('/' + args[i]).in(sessionId).emit(eventName, evt);
    }
  };

  var deleteAndNotify = function deleteAndNotify(socket, sid, userInfo, namespace, toNotify) {
    var args = Array.prototype.slice.call(arguments, 4);
    var screenName = userInfo.screenName;
    var eventName = 'asq:' + namespace + '-disconnected';
    var evt = {screenName: screenName};

    delete socket.request.session;
    delete socket.request.token;
    delete socket.request.screenName;

    logger.info('Removed ' + screenName + ' (token) on disconnect (' +
      screenName + ')');

    logger.info('Removed ' + sid + ' (session id) on disconnect (' +
      screenName + ')');

    socket.leave(sid);

    var emitToRolesBinded = emitToRoles
      .bind(this, eventName, evt, sid);
    emitToRolesBinded.apply(this, args);

    // emitToRoles(eventName, evt, sid, args);
    logger.info('[' + namespace.toUpperCase() + '] ' +
      screenName + ' disconnected');
    return when.resolve(true);
  }

  var ioConnect = gen.lift(function *ioConnectGen(socket, namespace) {

    var session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id);

    var evt = {slide: session.activeSlide};
    if (!!session.activeStatsQuestions.length) {
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    } else {
      socket.emit('asq:goto', evt);
      logger.info('[' + namespace.toUpperCase() + '] ' +
        socket.request.screenName + ' connected');
    }
  });

  var sendProgress = function sendProgress(progress, sessionId) {
    // Convert mongoose document to object
    if (progress instanceof AnswerProgress) {
      progress = progress.toObject();
    }
    // Add audience size to progress.
    // progress.audience = io.of('/folo').clients(sessionId).length;
    progress.audience = getNumOfConnectedClients('/folo', progress.session)

    // Send updated progress to ctrl
    emitToRoles('asq:submitted', {progress: progress},
      progress.session, 'ctrl');

    var defer = when.defer()
    process.nextTick(function resolve() {
      defer.resolve(progress);
    });
    return defer.promise;
  }

  var sendProgresses = function sendProgresses(sessionId) {
    AnswerProgress.find({session: sessionId}).lean().exec().then(
      function onProgressess(progresses) {
        if (progresses instanceof Array) {
          return when.map(progresses, function handleProgress(progress) {
            return sendProgress(progress, sessionId)
          });
        }
        var defer = when.defer()
        process.nextTick(function resolve() {
          defer.resolve(null);
        });
        return defer.promise;
      });
  }

  var enqueueAnswersForAssessment = function enqueueAnswersForAssessment(sessionId, exercise, answers, token) {
    return assessment.job.enqueue(sessionId, exercise,
      Object.keys(answers).map(function getAnswerDoc(i) {
        return answers[i];
      }));
  }

  var getSocketsForJobs = function getSocketsForJobs(jobs) {
    var pairs = [];
    var i = jobs.length;
    while (i--) {
      pairs.push(when.join(
        nodefn.call(client.lrange.bind(client), jobs[i].assessor.toString(), 0, -1),
        jobs[i])
      );
    }
    return when.all(pairs);
  }

  var activateJobsForSockets = function activateJobsForSockets(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.job.activateJob(pair[1]));
    });
  }

  var renderJobsForSockets = function renderJobsForSockets(JobSocketsPairs) {
    return when.map(JobSocketsPairs, function activate(pair) {
      return when.join(pair[0], assessment.render(pair[1]));
    });
  }

  var sendHtmlForSockets = function sendHtmlForSockets(HtmlSocketsPairs, exerciseId) {
    var j, pair, html, sockets;
    var i = HtmlSocketsPairs.length;
    while (i--) {
      pair = HtmlSocketsPairs[i];
      sockets = pair[0];
      html = pair[1];
      if (!!html) {
        j = sockets.length;
        while (j--) {
          logger.info('Sending assessment to idle viewer ' + sockets[j])
          io.of('/folo').socket(sockets[j]).emit('asq:assess',
            {html: html, exercise: exerciseId});
        }
      }
    }
  }

  function notifyCtrlForNewJobs(newJobs) {
    newJobs.forEach(function (newJob) {
      var jobEvt = {
        exerciseId: newJob.exercise,
        assessor: {token: newJob.assessor},
        assessee: {token: newJob.assessee}
      };
      emitToRoles('asq:new-assessment-job', jobEvt, newJob.session, 'ctrl');
    });
  }

  var getNumOfConnectedClients = function getNumOfConnectedClients(namespace, room) {
    var num = 0;
    try {
      var adapterRoom = io.nsps[namespace].adapter.rooms[room];
      if (adapterRoom) {
        num = Object.keys(adapterRoom).length;
      }
    } catch (err) {
      logger.error(err.toString() + err.stack);
      num = 0;
    } finally {
      return num;
    }
  }

  var getConnectedClients = function getConnectedClients(namespace, room) {
    try {
      var adapterRoom = io.nsps[namespace].adapter.rooms[room];
      if (adapterRoom) {
        return Promise.map(Object.keys(adapterRoom), function (id) {
          var socket = io.sockets.connected[id];
          return Promise.promisify(getTokenAndScreenName)(socket);
        });
      }
      return Promise.resolve([])
    } catch (err) {
      logger.error(err.toString() + err.stack);
    }
  }

  var sendConnectedClients = function sendConnectedClients(sessionId, namespaces) {
    if (arguments.length < 2) {
      return;
    }

    allNspcs = Array.prototype.slice.call(arguments, 1);

    Promise.map(['/folo', '/ctrl', '/ghost'], function (nspc) {
      return getConnectedClients(nspc, sessionId);
    }).then(function (clients) {
      var evt = {
        connectedViewers: clients[0],
        connectedPresenters: clients[1],
        connectedGhosts: clients[2]
      };

      var emitToRolesBinded = emitToRoles
        .bind(this, 'asq:connected-clients', evt, sessionId);
      emitToRolesBinded.apply(this, allNspcs);
    })
  }

  var sendSubmissions = function sendSubmissions(socket, sessionId, token) {
    var defer = when.defer();
    Answer.distinct('exercise', {session: sessionId, answeree: token})
      .exec().then(
      function onExercises(exercises) {
        if (!exercises) {
          defer.resolve(null);
        }
        var i = exercises.length;
        while (i--) {
          socket.emit('asq:submitted',
            {exercise: exercises[i], status: 'confirmation', type: 'answer'});
        }
        defer.resolve(exercises);
      }, function onError(err) {
        defer.reject(err);
      }
    );
    return defer.promise;
  }

  var saveConnectionToRedis = function saveConnectionToRedis(token, socket) {
    return nodefn.call(client.lpush.bind(client), token.toString(), socket.id)
  }

  var removeConnectionFromRedis = function removeConnectionFromRedis(token, socket) {
    return nodefn.call(
      client.lrem.bind(client), token.toString(), 0, socket.id);
  }

  // socketPubSub.on('session-terminated', function(evt){
  //   emitToRoles('asq:session-terminated', {}, evt.s._id,
  //       'ctrl', 'folo', 'ghost', 'stat');
  //   });
  // })

  socketPubSub.on('emitToRoles', function (evt) {
    emitToRoles
      .bind(this, evt.evtName, evt.event, evt.sessionId)
      .apply(this, evt.namespaces);

  });

  socketPubSub.on('emit', function (evt) {
    //search for our id in all namespaces (not very efficient I must say)
    for (var name in  io.nsps) {
      // we don't care about the root namespace since no-one should connect there
      if (name == '/') continue;

      if (io.nsps[name].connected[evt.socketId]) {
        io.nsps[name].connected[evt.socketId].emit(evt.evtName, evt.event);
        break;
      }
    }
  });

  socketPubSub.on('presentation_conversion_progress', function (evt) {
    // Maybe promisify this?
    nodefn.call(client.lrange.bind(client), evt.data.owner_id.toString(), 0, -1)
      .then(function (socketIDs) {
          switch (evt.type) {
            case 's2h_progress':
              socketIDs.forEach((socketID) => {
                io.to(socketID.toString()).emit('message',
                  {
                    type: "change",
                    resource: "presentations",
                    body: {
                      object_id: evt.data.slideshow_id,
                      data: {
                        phase: "converting_pdf_to_html",
                        progress: evt.data.current_slide / evt.data.total_slides
                      }
                    }
                  });
              });
              break;
            case 's2h_complete':
              socketIDs.forEach((socketID) => {
                io.to(socketID.toString()).emit('message',
                  {
                    type: "change",
                    resource: "presentations",
                    body: {
                      object_id: evt.data.slideshow_id,
                      data: {
                        phase: "conversion_done"
                      }
                    }
                  });
              });
              break;
          }

      });


  });

  return {
    activateJobsForSockets: activateJobsForSockets,
    deleteAndNotify: deleteAndNotify,
    enqueueAnswersForAssessment: enqueueAnswersForAssessment,
    getTokenAndScreenName: getTokenAndScreenName,
    getSocketsForJobs: getSocketsForJobs,
    notifyCtrlForNewJobs: notifyCtrlForNewJobs,
    emitToRoles: emitToRoles,
    getNumOfConnectedClients: getNumOfConnectedClients,
    renderJobsForSockets: renderJobsForSockets,
    removeConnectionFromRedis: removeConnectionFromRedis,
    saveConnectionToRedis: saveConnectionToRedis,
    sendConnectedClients: sendConnectedClients,
    sendHtmlForSockets: sendHtmlForSockets,
    sendProgress: sendProgress,
    sendProgresses: sendProgress,
    sendSubmissions: sendSubmissions
  }
}
