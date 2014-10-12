/** @module lib/socket/authentication
    @description Authentication logic for sockets
*/

'use strict';

var Session         = db.model('Session')
  , WhitelistEntry  = db.model('WhitelistEntry');

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

  // var token = authUtils.getSessionFromCookie(request.headers.cookie);
  // // Check if cookie is valid.
  // if (!token) {
  //   process.nextTick(function onInvalidCookie(){
  //     next(new Error('Invalid cookie'));
  //   });
  //   return;
  // }

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
  ctrlAuthorize : ctrlAuthorize,
  liveAuthorize : liveAuthorize
};