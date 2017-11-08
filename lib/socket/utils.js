/** @module lib/socket/utils
 @description socket utilities
 */

const _ = require('lodash');
const logger = require('logger-asq');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const arrayEqual = require('../stats').arrayEqual;
const flow = require('../flow');
const assessment = require('../assessment');
const Answer = db.model('Answer');
const AnswerProgress = db.model('AnswerProgress');
const Assessment = db.model('Assessment');
const AssessmentJob = db.model('AssessmentJob');
const Exercise = db.model('Exercise');
const Question = db.model('Question');
const Session = db.model('Session');
const User = db.model('User');
const WhitelistEntry = db.model('WhitelistEntry');

module.exports = function (io, client, socketPubSub) {

  /**
   *  Get the dislayName stored with a socket.
   *  This function was rewritten to support a promise.
   */
  const getTokenAndScreenName = coroutine(function *getTokenAndScreenName(socket, callback) {
    const returnData = {};
    try {
      const token = socket.request.token;
      if (!token) {
        return Promise.reject(new Error('Unable to retrieve token.'));
      }
      returnData.token = token;

      const entry = yield WhitelistEntry.findOne({_id: token}, 'screenName').exec();
      if (!entry || !entry.screenName) {
        throw (new Error(`Screen name not found for ${token}.`));
      }

      returnData.screenName = entry.screenName;
    } catch (err) {
      if (callback && typeof callback === 'function') {
        callback(err, null);
        return;
      } else {
        return Promise.reject(err);
      }
    }

    if (callback && typeof callback === 'function') {
      callback(null, returnData);
    }
    return returnData;
  });

  const emitToRoles = function (eventName, evt, sessionId, namespaces) {
    if (arguments.length < 4) {
      return;
    }
    const args = Array.prototype.slice.call(arguments, 3);
    for (let i = 0; i < args.length; i++) {
      io.of('/' + args[i]).in(sessionId).emit(eventName, evt);
    }
  };

  const emitToViewerWhitelistEntry = function (eventName, evt, WhitelistEntryId) {
    Object.keys(io.nsps['/folo'].connected).forEach(key => {
      const socket = io.nsps['/folo'].connected[key];
      if(socket.request.token.toString() === WhitelistEntryId.toString())
        socket.emit(eventName, evt);
    })
  };

  const deleteAndNotify = function deleteAndNotify(socket, sid, userInfo, namespace, toNotify) {
    const args = Array.prototype.slice.call(arguments, 4);
    const screenName = userInfo.screenName;
    const eventName = `asq:${namespace}-disconnected`;
    const evt = {screenName: screenName};

    delete socket.request.session;
    delete socket.request.token;
    delete socket.request.screenName;

    logger
      .info(`Removed ${screenName} (token) on disconnect (${screenName})`);
    
    logger
      .info(`Removed ${sid} (session id) on disconnect (${screenName})`);

    socket.leave(sid);

    const emitToRolesBinded = emitToRoles
      .bind(this, eventName, evt, sid);
    emitToRolesBinded.apply(this, args);

    // emitToRoles(eventName, evt, sid, args);
    logger
      .info(`[${namespace.toUpperCase()}] ${socket.request.screenName} disconnected`);

    return Promise.resolve(true);
  }

  const ioConnect = coroutine(function *ioConnectGen(socket, namespace) {

    const session = yield Session.findOne({_id: socket.request.sessionId}).exec();
    socket.join(session._id.toString());

    const evt = {slide: session.activeSlide};
    if (!!session.activeStatsQuestions.length) {
      socket.emit('asq:goto', evt);
      logger
        .info(`[${namespace.toUpperCase()}] ${socket.request.screenName} connected`);
    } else {
      socket.emit('asq:goto', evt);
      logger
        .info(`[${namespace.toUpperCase()}] ${socket.request.screenName} connected`);
    }
  });

  const sendProgress = coroutine(function *sendProgressGen(progress, sessionId) {
    // Convert mongoose document to object
    if (progress instanceof AnswerProgress) {
      progress = progress.toObject();
    }

    // Add audience size to progress.
    // progress.audience = io.of('/folo').clients(sessionId).length;
    progress.audience = yield getNumOfConnectedClients('/folo', progress.session.toString())

    // Send updated progress to ctrl
    emitToRoles('asq:submitted', {progress: progress},
      progress.session, 'ctrl');

    return progress;
  });

  const sendProgresses = function sendProgresses(sessionId) {
    return AnswerProgress.find({session: sessionId}).lean().exec().then(
      function onProgressess(progresses) {
        if (progresses instanceof Array) {
          return Promise.map(progresses, function handleProgress(progress) {
            return sendProgress(progress, sessionId)
          });
        }
        return Promise.resolve(null);
      });
  }

  const enqueueAnswersForAssessment = function enqueueAnswersForAssessment(sessionId, exercise, answers, token) {
    return assessment.job.enqueue(sessionId, exercise,
      Object.keys(answers).map(function getAnswerDoc(i) {
        return answers[i];
      }));
  }

  const getSocketsForJobs = function getSocketsForJobs(jobs) {
    const pairs = [];
    let i = jobs.length;
    while (i--) {
      pairs.push(Promise.join(
        client.lrangeAsync(jobs[i].assessor.toString(), 0, -1),
        jobs[i])
      );
    }
    return Promise.all(pairs);
  }

  const activateJobsForSockets = function activateJobsForSockets(JobSocketsPairs) {
    return Promise.map(JobSocketsPairs, function activate(pair) {
      return Promise.join(pair[0], assessment.job.activateJob(pair[1]));
    });
  }

  const renderJobsForSockets = function renderJobsForSockets(JobSocketsPairs) {
    return Promise.map(JobSocketsPairs, function activate(pair) {
      return Promise.join(pair[0], assessment.render(pair[1]));
    });
  }

  const sendHtmlForSockets = function sendHtmlForSockets(HtmlSocketsPairs, exerciseId) {
    let j, pair, html, sockets;
    let i = HtmlSocketsPairs.length;
    while (i--) {
      pair = HtmlSocketsPairs[i];
      sockets = pair[0];
      html = pair[1];
      if (!!html) {
        j = sockets.length;
        while (j--) {
          logger.info(`Sending assessment to idle viewer ${sockets[j]}`)
          io.of('/folo').socket(sockets[j]).emit('asq:assess',
            {html: html, exercise: exerciseId});
        }
      }
    }
  }

  function notifyCtrlForNewJobs(newJobs) {
    newJobs.forEach(function (newJob) {
      const jobEvt = {
        exerciseId: newJob.exercise,
        assessor: {token: newJob.assessor},
        assessee: {token: newJob.assessee}
      };
      emitToRoles('asq:new-assessment-job', jobEvt, newJob.session, 'ctrl');
    });
  }

  const getNumOfConnectedClients = function getNumOfConnectedClients(namespace, room) {
    return new Promise(function(resolve, reject){
      if(! _.isString(namespace)){
        return reject('Expected `namespace` to be a String')
      }
      if(! _.isString(room)){
        return reject('Expected `room` to be a String')
      }

      io.of(namespace).in(room).clients(function(error, clients){
        if (error) return reject(error);
        
        return resolve(clients.length);
      });
    });
  }

  const getConnectedClients = function getConnectedClients(namespace, room) {
    return new Promise(function(resolve, reject){
      if(! _.isString(namespace)){
        return reject('Expected `namespace` to be a String')
      }
      if(! _.isString(room)){
        return reject('Expected `room` to be a String')
      }

      io.of(namespace).in(room).clients(function(error, clients){
        if (error) return reject(error);

        Promise.map(clients, function (id) {
          // namespaced socket ids start with the namespace string
          // so we remove it first
          const re = new RegExp(`^${namespace}#`);
          const rawId = id.replace(re, '');

          const socket = io.sockets.connected[rawId];
          return Promise.promisify(getTokenAndScreenName)(socket);
        }).then(resolve, reject);
      });
    });
  }

  const sendConnectedClientsAfter1Ms = function sendConnectedClientsAfter1Ms(sessionId, namespaces) {
    if (arguments.length < 2) {
      return;
    }

    const args = arguments;

    // unfortunately it doesn't work reliably with process.nextTick
    // maybe socket.io uses timers?
    setTimeout(() => {
      allNspcs = Array.prototype.slice.call(args, 1);

      Promise.map(['/folo', '/ctrl', '/ghost'], function (nspc) {
        return getConnectedClients(nspc, sessionId);
      }).then(function (clients) {
        const evt = {
          connectedViewers: clients[0],
          connectedPresenters: clients[1],
          connectedGhosts: clients[2]
        };

        const emitToRolesBinded = emitToRoles
          .bind(this, 'asq:connected-clients', evt, sessionId);
        emitToRolesBinded.apply(this, allNspcs);
      })
    }, 1);
  }

  const sendSubmissions = function sendSubmissions(socket, sessionId, token) {
    return Answer
      .distinct('exercise', { session: sessionId, answeree: token })
      .exec()
      .then(
      function onExercises(exercises) {
        if (!exercises) {
          return Promise.resolve(null);
        }
        let i = exercises.length;
        while (i--) {
          socket.emit('asq:submitted',
            {exercise: exercises[i], status: 'confirmation', type: 'answer'});
        }
        return Promise.resolve(exercises);
      });
  }

  const saveConnectionToRedis = function saveConnectionToRedis(token, socket) {
    return client.lpushAsync(token.toString(), socket.id);
  }

  const removeConnectionFromRedis = function removeConnectionFromRedis(token, socket) {
    return client.lremAsync(token.toString(), 0, socket.id);
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
    for (let name in  io.nsps) {
      // we don't care about the root namespace since no-one should connect there
      if (name == '/') continue;

      if (io.nsps[name].connected[evt.socketId]) {
        io.nsps[name].connected[evt.socketId].emit(evt.evtName, evt.event);
        break;
      }
    }
  });

  function createChangePresentationEvent(presentationId, phase, progress) {
    const data = {
      phase
    };
    if(typeof progress !== undefined){
      data.progress = progress
    }
    return {
      type: 'change',
      body: {
        entity: 'presentations',
        object: {
          id: presentationId
        },
        data
      }
    }
  }

  socketPubSub.on('presentation_conversion_progress', function (evt) {
    const data = evt.data;
    let changeEvent;
    // Maybe promisify this?
    client.lrangeAsync( evt.data.owner_id.toString(), 0, -1)
      .then(function (socketIDs) {
        switch (evt.type) {
          case 's2h_progress':
            changeEvent = createChangePresentationEvent(data.slideshow_id, 'converting_pdf_to_html',
              (data.current_slide / data.total_slides));
            socketIDs.forEach((socketID) => {
              io.to(socketID.toString()).emit('message', changeEvent);
            });
            break;
          case 'injection_progress':
            changeEvent = createChangePresentationEvent(data.slideshow_id, 'injecting_questions');
            socketIDs.forEach((socketID) => {
              io.to(socketID.toString()).emit('message', changeEvent);
            });
            break;
          case 'conversion_complete':
            changeEvent = createChangePresentationEvent(data.slideshow_id, 'done');
            socketIDs.forEach((socketID) => {
              io.to(socketID.toString()).emit('message', changeEvent);
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
    emitToViewerWhitelistEntry: emitToViewerWhitelistEntry,
    getNumOfConnectedClients: getNumOfConnectedClients,
    renderJobsForSockets: renderJobsForSockets,
    removeConnectionFromRedis: removeConnectionFromRedis,
    saveConnectionToRedis: saveConnectionToRedis,
    sendConnectedClientsAfter1Ms: sendConnectedClientsAfter1Ms,
    sendHtmlForSockets: sendHtmlForSockets,
    sendProgress: sendProgress,
    sendProgresses: sendProgresses,
    sendSubmissions: sendSubmissions
  }
}
