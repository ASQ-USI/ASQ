/** @module lib/socket/authentication
    @description Authentication logic for sockets
*/

'use strict';

const Session         = db.model('Session');
const Slideshow       = db.model('Slideshow');
const User            = db.model('User');
const GuestUser       = db.model('GuestUser');
const WhitelistEntry  = db.model('WhitelistEntry');
const Promise         = require('bluebird');
const coroutine       = Promise.coroutine;


module.exports = {

  /**
  * Socket middleware to allow presenters to connect to a live presentation
  * @param socket {Object} The socket that tries to connect
  * @param next {Function} The function to call the next socket.io middleware when done
  */
  ctrlAuthorize: coroutine(function *ctrlAuthorizeGen(socket, next) {  

    try{
      const request = socket.request;
      // check if the session was sent.
      if (!request._query || !request._query.asq_sid) {
        return next(new Error('Missing session'));
      }

      // check if the user was sent.
      if (!request.user){
        return next(new Error('Missing user'));
      }

      // check if session exists
      const liveSid = request._query.asq_sid;
      const session = yield Session.findById(liveSid).exec();
      if (!session) {
        return next(new Error('Unable to find session'));
      }

      //check if user is allowed to join in
      const user = socket.user = request.user;
      const entry =  yield WhitelistEntry.findOne({
        user   : user._id,
        session : liveSid,
        role    : 'presenter'
      }).exec();

      if (!entry) {
        return next(new Error('Not authorized'));
      }

      request.sessionId = session._id;
      request.token = entry._id;
      request.screenName = entry.screenName;
      return next();
    }catch(err){
      return next(err);
    }
  }),

  /**
  * Socket middleware to allow viewers to connect to a live presentation
  * @param socket {Object} The socket that tries to connect
  * @param next {Function} The function to call the next socket.io middleware when done
  */
  liveAuthorize: coroutine(function *liveAuthorize(socket, next) {
    try{
      const request = socket.request;
      // check if the session was sent
      if (!request._query || !request._query.asq_sid) {
        return next(new Error('Missing session'));
      }
      
      // check if the cookie was sent
      if (!request.headers ||  !request.headers.cookie) {
        return next(new Error('Not authenticated or missing cookie'));
      }

      // check if session exists
      const liveSid = request._query.asq_sid;
      const session = yield Session.findById(liveSid).exec();
      if (!session) {
        return next(new Error('Unable to find session'));
      }

      let user = request.user;
      if(user.hasOwnProperty('logged_in') 
          && user.logged_in === false){
        user = null;
      }

      const userid = user 
        ? user._id
        : null;
      const browserSessionId = request.sessionID;
      
      // check if allowed to join in

      const entry = yield WhitelistEntry.findOne({
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

      if(!user){
        // it must be a guest user ...
        user = yield GuestUser.findById(entry.user).exec();

        // if (!user) {
        //   // or a normal user
        //   user = yield User.findById(entry.user).exec();
        // }

        if (!user) {
          return next(new Error('Unable to find user'));
        }
      }

      request.sessionId  = session._id;
      request.token      = entry._id;
      request.screenName = entry.screenName;

      socket.user = user;
      next();

    }catch(err){
      next(err);
    }
  }),

  persistAuthenticatedUserToRedis: function(utils){
    return function persistAuthenticatedUserToRedisMd(socket, next) {
    if(! socket.request.user.hasOwnProperty('logged_in') 
      || socket.request.user.logged_in === false){
      return next();
    }
    utils.saveConnectionToRedis(socket.request.user.id, socket)
      .then(function() {
        next();
      })
      .catch(function(err) {
        next(err);
      });
    }
  }

  };