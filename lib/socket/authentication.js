/** @module lib/socket/authentication
    @description Authentication logic for sockets
*/

'use strict';

var Session         = db.model('Session');
var Slideshow       = db.model('Slideshow');
var User            = db.model('User');
var GuestUser       = db.model('GuestUser');
var WhitelistEntry  = db.model('WhitelistEntry');
var Promise         = require("bluebird");
var coroutine       = Promise.coroutine;


module.exports = {

  // Socket auth for ctrl
  ctrlAuthorize: function ctrlAuthorize(socket, next) {  
    var request = socket.request;
    // Check if the session was sent.
    if (!request._query || !request._query.asq_sid) {
      process.nextTick( function(){
        next(new Error('Missing session'));
      });
      return;
    }

    var liveSid = request._query.asq_sid;
    var user = socket.user = request.user;

    //Check if allowed to join in
    WhitelistEntry.findOne({
      user   : user._id,
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
  },

  // Socket auth
  liveAuthorize: coroutine(function *liveAuthorize(socket, next) {
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

    var liveSid = request._query.asq_sid;
    var user = request.user;
    var userid = user 
      ? user._id
      : null;
    var browserSessionId = request.sessionID;
    
    //Check if allowed ot join in
    try{
      var entry = yield WhitelistEntry.findOne({
        $or : [
          {browserSessionId   : browserSessionId}, 
          { $and: [ {role    : 'presenter'}, {user : userid} ]} //registered user
        ],
        session : liveSid,
      }).exec()

      if (!entry) {
        next(new Error('Not authorized'));
        return;
      }

      var session = yield Session.findById(liveSid).exec();

      if (!session) {
        return next(new Error('Unable to find session'));
      }

      request.sessionId  = session._id;
      request.token      = entry._id;
      request.screenName = entry.screenName;

      if(!user){
        console.log("after")
        //it must be a guest user ...
        user = yield GuestUser.findById(entry.user).exec()

        if (!user) {
          // or a normal user
          user = yield User.findById(entry.user).exec()
        }

        if (!user) {
          return next(new Error('Unable to find user'));
        }
      }
      socket.user = user;
      next();

    }catch(err){
      next(err);
    }
  })

};