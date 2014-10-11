/** @module lib/authentication
    @description Authentication logic
*/

'use strict';

//TODO : update tokens from cookies to jwt

var generateName    = require('sillyname')
  , when            = require('when')
  , utils           = require('./utils')
  , appLogger       = require('./logger').appLogger
  , presUtils       = utils.presentation
  , authUtils       = utils.auth
  , GuestUser       = db.model('GuestUser')
  , Session         = db.model('Session')
  , WhitelistEntry  = db.model('WhitelistEntry')
  , userCounter     = 0;

/**
 *  Authentication object for sessions
 *  it contains three middlewares, one for each level.
 */
var liveSessionAuthorize = {
  'public': function publicLiveSessionAuthorize(req, res, next) {
    var browserSessionId = req.sessionID;
    if (!browserSessionId) {
      next(new Error('Unable to retrieve cookie.'));
      return;
    }
    var deferred = when.defer();

    if (req.isAuthenticated()){
      process.nextTick(function resolveRegisteredUser() {
        appLogger.debug('Registered user connected');
        deferred.resolve({
          _id        : req.user._id,
          screenName : req.user.screenName
        });
      });
    } else {
      appLogger.debug('Guest user connected');
      GuestUser.findOne({ browserSessionId : browserSessionId }, '_id screenName', function (err, user) {
        if (err) {
          return when.reject(err);
        }
        if (!user) {
          var guestUser = new GuestUser({
            browserSessionId      : browserSessionId,
            screenName : generateName()
          }).save(function onSave(err, savedGuest) {
            if (err) {
              deferred.reject(err);
              return;
            }
            deferred.resolve({
              _id        : savedGuest._id,
              screenName : savedGuest.screenName
            });
          });
        } else {
          deferred.resolve(user);
        }
      });
    }
    deferred.promise.then(
    function findWhitelistEntry(user) {
      return when.join(user,
        WhitelistEntry.findOne({
          user    : user._id,
          session : req.liveSession._id,
        }).exec());
    }).then(
    function generateWhitelistEntry(data) {
      var deferred = when.defer();
      var user = data[0];
      var entry = data[1];
      if (!entry || entry === null) {
        entry = new WhitelistEntry({
          user    : user._id,
          session : req.liveSession._id
        });
      }
      entry.browserSessionId = browserSessionId;
      entry.screenName = user.screenName;
      entry.save(function onSave(err, savedEntry) {
        if (err) {
          deferred.reject(err);
        } else {
          deferred.resolve(savedEntry);
        }
      });
      return deferred.promise;
    }).then(
    function onEntry(entry) {
      if (!entry) {
        return when.reject('You can\'t access this session.');
      }
      req.whitelistEntry = entry;
      req.session.touch(); // update cookie
      next();
    }).then(null,
    function onError(err) {
      next(err instanceof Error ? err : new Error(err));
    });
  },

  'anonymous': function anonymousLiveSessionAuthorize(req, res, next) {
    if (req.isAuthenticated()) {
      var browserSessionId = req.sessionID;
      if (!browserSessionId) {
        next(new Error('Unable to retrieve cookie.'));
        return;
      }
      WhitelistEntry.findOne({
        user    : req.user._id,
        session : req.liveSession._id
      }).exec()
      .then(
        function onEntry(entry) {
          var deferred = when.defer();
          if (!entry) {
            process.nextTick(function onNoEntry() {
              deferred.reject(new Error ('Can\'t access this session'));
            });
          } else if (entry.browserSessionId !== browserSessionId) {
            entry.browserSessionId = browserSessionId;
            entry.save(function onSave(err, savedEntry) {
              if(err) {
                deferred.reject(err);
              } else {
                deferred.resolve(savedEntry);
              }
            });
          } else {
            process.nextTick(function onSameEntry() {
              deferred.resolve(entry);
            });
          }
        })
      .then(
        function onValidEntry(entry) {
          req.whitelistEntry = entry;
          req.session.touch();
          next(null);
        },
        function onError(err) {
          next(err instanceof Error ? err : new Error(err));
        });
    } else {
      // TOOO throw could not authenticate error and handle it
      req.session.redirect_to = req.originalUrl;
      res.redirect('/login/');
    }
  },

  'private': function privateLiveSessionAuthorize(req, res, next) {
    if (req.isAuthenticated()) {
      var browserSessionId = req.sessionID;
      if (!browserSessionId) {
        next(new Error('Unable to retrieve cookie.'));
        return;
      }
      WhitelistEntry.findOne({
        user    : req.user._id,
        session : req.liveSession._id
      }).then(
        function onEntry(entry) {
          var deferred = when.defer();
          if (!entry) {
            process.nextTick(function onNoEntry() {
              deferred.reject(new Error ('Can\'t access this session'));
            });
          } else if (entry.browserSessionId !== browserSessionId) {
            entry.browserSessionId = browserSessionId;
            entry.save(function onSave(err, savedEntry) {
              if(err) {
                deferred.reject(err);
              } else {
                deferred.resolve(savedEntry);
              }
            });
          } else {
            process.nextTick(function onSameEntry() {
              deferred.resolve(entry);
            });
          }
        })
      .then(
        function onValidEntry(entry) {
          req.whitelistEntry = entry;
          req.session.touch();
          next(null);
        },
        function onError(err) {
          next(err instanceof Error ? err : new Error(err));
        });
    } else {
      // TOOO throw could not authenticate error and handle it
      req.session.redirect_to = req.originalUrl;
      res.redirect('/login/');
    }
  }
};

/** Grant or deny access to the current session to potential viewers. */
function authorizeLiveSession(req, res, next) {
  liveSessionAuthorize[req.liveSession.authLevel](req, res, next);
}

// Socket auth for ctrl
function ctrlAuthorize(socket, next) {  
  var request = socket.request;
  // Check if the session was sent.
  if (!request._query || !request._query.asq_sid) {
    process.nextTick( function(){
      next(new Error('Missing session'));
    });
    return;
  }

  var liveSid = request._query.asq_sid;
  var user = socket.decoded_token.user;
  var browserSessionId = socket.decoded_token.browserSessionId;

  //Check if allowed to join in
  WhitelistEntry.findOne({
    user   : user._id,
    browserSessionId : browserSessionId,
    session : liveSid,
    role    : 'presenter'
  }, function(err, entry){
      if (err) {
        next(err);
        return;
      }
      if (!entry) {
        next(new Error('Not authorized'));
        return;
      }
      Session.findById(liveSid, function(err, session) {
        if (err) {
          return next(err);
        }
        if (!session) {
          return next(new Error('Unable to find session'));
        }
        request.sessionId   = session._id;
        request.token      = entry._id;
        request.screenName = entry.screenName;
        next();
      });
  });
}

// Socket auth
function liveAuthorize(socket, next) {
  var request = socket.request;
  // Check if the session was sent.
  if (!request._query || !request._query.asq_sid) {
    process.nextTick( function(){
      next(new Error('Missing session'));
    });
    return;
  }

  if (!request.headers || !request.headers.cookie) {
    process.nextTick( function onNoSession() {
      next(new Error('Not authenticated or missing cookie'));
    });
    return;
  }

  var token = authUtils.getSessionFromCookie(request.headers.cookie);
  // Check if cookie is valid.
  if (!token) {
    process.nextTick(function onInvalidCookie(){
      next(new Error('Invalid cookie'));
    });
    return;
  }

  var liveSid = request._query.asq_sid;
  var browserSessionId = socket.decoded_token.browserSessionId;

  //Check if allowed ot join in
  WhitelistEntry.findOne({
    browserSessionId   : browserSessionId,
    session : liveSid,
  }, function(err, entry){
      if (err) {
        next(err);
        return;
      }
      if (!entry) {
        next(new Error('Not authorized'));
        return;
      }
      Session.findById(liveSid, function(err, session) {
        if (err) {
          return next(err);
        }
        if (!session) {
          return next(new Error('Unable to find session'));
        }
        request.sessionId  = session._id;
        request.token      = entry._id;
        request.screenName = entry.screenName;
        next();
      });
  });
}

module.exports = {
  authorizeLiveSession : authorizeLiveSession,
  ctrlAuthorize    : ctrlAuthorize,
  liveAuthorize    : liveAuthorize
};
