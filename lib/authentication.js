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
var sessionAuthorize = {
  'public': function publicSessionAuthorize(req, res, next) {
    if (!req.headers || !req.headers.cookie) {
      next(new Error('Unable to retrieve cookie.'));
      return;
    }
    var token = authUtils.getSessionFromCookie(req.headers.cookie);
    if (!token) {
      next(new Error('Unable to retrieve cookie.'));
      return;
    }
    var deferred = when.defer();

    if (req.isAuthenticated()){
      process.nextTick(function resolveRegisteredUser() {
        appLogger.debug('Registered user connected');
        deferred.resolve({ _id : req.user._id, screenName : req.user.screenName });
      });
    } else {
      appLogger.debug('Guest user connected');
      GuestUser.findOne({ token : token }, '_id screenName', function (err, user) {
        if (err) {
          return when.reject(err);
        }
        if (!user) {
          var guestUser = new GuestUser({
            token      : token,
            screenName : generateName()
          }).save(function onSave(err, savedGuest) {
            if (err) {
              deferred.reject(err);
              return;
            }
            deferred.resolve({ _id : savedGuest._id, screenName: savedGuest.screenName });
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
          uid : user._id,
          session : req.liveSession._id,
        }).exec());
    }).then(
    function generateWhitelistEntry(data) {
      var deferred = when.defer();
      var user = data[0];
      var entry = data[1];
      if (!entry || entry === null) {
        entry = new WhitelistEntry({
          uid : user._id,
          session : req.liveSession._id
        });
      }
      entry.token = token;
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

  'anonymous': function anonymousSessionAuthorize(req, res, next) {
    if (req.isAuthenticated()) {
      var token = authUtils.getSessionFromCookie(req.headers.cookie);
      if (!token) {
        next(new Error('Unable to retrieve cookie.'));
        return;
      }
      WhitelistEntry.findOne({
        uid     : req.user._id,
        session : req.liveSession._id
      }).exec()
      .then(
        function onEntry(entry) {
          var deferred = when.defer();
          if (!entry) {
            process.nextTick(function onNoEntry() {
              deferred.reject(new Error ('Can\'t access this session'));
            });
          } else if (entry.token !== token) {
            entry.token = token;
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

  'private': function privateSessionAuthorize(req, res, next) {
    if (req.isAuthenticated()) {
      var token = authUtils.getSessionFromCookie(req.headers.cookie);
      if (!token) {
        next(new Error('Unable to retrieve cookie.'));
        return;
      }
      WhitelistEntry.findOne({
        uid     : req.user._id,
        session : req.liveSession._id
      }).then(
        function onEntry(entry) {
          var deferred = when.defer();
          if (!entry) {
            process.nextTick(function onNoEntry() {
              deferred.reject(new Error ('Can\'t access this session'));
            });
          } else if (entry.token !== token) {
            entry.token = token;
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
function authorizeSession(req, res, next) {
  sessionAuthorize[req.liveSession.authLevel](req, res, next);
}

// Socket auth for ctrl
function ctrlAuthorize(handshakeData, callback) {

  // Check if the session was sent.
  if (!handshakeData.query || !handshakeData.query.sid) {
    process.nextTick( function(){
      callback(new Error('Missing session'), false);
    });
    return;
  }

  // check if cookie was sent.
  if (!handshakeData.headers || !handshakeData.headers.cookie) {
    process.nextTick( function(){
      callback(new Error('Not authenticated or missing cookie'), false);
    });
    return;
  }

  var token = authUtils.getSessionFromCookie(handshakeData.headers.cookie);
  // Check if cookie is valid.
  if (!token) {
    process.nextTick( function(){
      callback(new Error('Invalid cookie'), false);
    });
    return;
  }

  //Check if allowed ot join in
  WhitelistEntry.findOne({
    token   : token,
    session : handshakeData.query.sid,
    role    : 'presenter'
  }, function(err, entry){
      if (err) {
        callback(err, false);
        return;
      }
      if (!entry) {
        callback(new Error('Not authorized'), false);
        return;
      }
      Session.findById(handshakeData.query.sid, function(err, session) {
        if (err) {
          return callback(err, false);
        }
        if (!session) {
          return callback(new Error('Unable to find session'), false);
        }
        handshakeData.session    = session;
        handshakeData.token      = entry._id;
        handshakeData.screenName = entry.screenName;
        callback(null, true);
      });
  });
}

// Socket auth
function liveAuthorize(handshakeData, callback) {

  // Check if the session was sent.
  if (!handshakeData.query || !handshakeData.query.sid) {
    process.nextTick( function(){
      callback(new Error('Missing session'), false);
    });
    return;
  }

  if (!handshakeData.headers || !handshakeData.headers.cookie) {
    process.nextTick( function onNoSession() {
      callback(new Error('Not authenticated or missing cookie'), false);
    });
    return;
  }

  var token = authUtils.getSessionFromCookie(handshakeData.headers.cookie);
  // Check if cookie is valid.
  if (!token) {
    process.nextTick(function onInvalidCookie(){
      callback(new Error('Invalid cookie'), false);
    });
    return;
  }

  //Check if allowed ot join in
  WhitelistEntry.findOne({
    token   : token,
    session : handshakeData.query.sid,
  }, function(err, entry){
      if (err) {
        callback(err, false);
        return;
      }
      if (!entry) {
        callback(new Error('Not authorized'), false);
        return;
      }
      Session.findById(handshakeData.query.sid, function(err, session) {
        if (err) {
          return callback(err, false);
        }
        if (!session) {
          return callback(new Error('Unable to find session'), false);
        }
        handshakeData.session    = session;
        handshakeData.token      = entry._id;
        handshakeData.screenName = entry.screenName;
        callback(null, true);
      });
  });
}

module.exports = {
  authorizeSession : authorizeSession,
  ctrlAuthorize    : ctrlAuthorize,
  liveAuthorize    : liveAuthorize
};