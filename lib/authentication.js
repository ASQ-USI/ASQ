/** @module lib/authentication
    @description Authentication logic
*/

'use strict';

const generateName    = require('sillyname')
const logger          = require('logger-asq');
const GuestUser       = db.model('GuestUser');
const WhitelistEntry  = db.model('WhitelistEntry');
const Promise         = require("bluebird");
const coroutine       = Promise.coroutine;

/**
 *  Authentication object for sessions
 *  it contains three middlewares, one for each level.
 */

  const liveSessionAuthorize = {
  'public': coroutine(function *publicLiveSessionAuthorizeGen(req, res, next) {

    try{
      let browserSessionId = req.sessionID;
      if (!browserSessionId) {
        throw new Error('Unable to retrieve cookie.');
        return;
      }
      
      let user;

      if (req.isAuthenticated()){
        logger.debug('Registered user connected');
        user = req.user;
      } else {
        logger.debug('Guest user connected ' + browserSessionId);
        user = yield GuestUser.findOne({ browserSessionId : browserSessionId }, '_id screenName').exec();
        if (!user) {
          //accept guest users
          req.session.isGuest = true;
          const saveFn = Promise.promisify(req.session.save.bind(req.session));
          yield saveFn()

          user = yield new GuestUser({
              browserSessionId : browserSessionId,
              screenName : generateName()
            }).save();
        }
      }

      let entry = yield WhitelistEntry.findOne({
        user    : user._id,
        session : req.liveSession._id,
      }).exec();

      if (!entry || entry === null) {
        entry = new WhitelistEntry({
          user    : user._id,
          session : req.liveSession._id,
          browserSessionId: browserSessionId,
          screenName:  user.screenName
        });
      }
      entry.sessionData = {};
      entry.markModified('sessionData');

      entry = yield entry.save();

      if (!entry) {
        throw new Error('You can\'t access this session.');
      }

      req.whitelistEntry = entry;
      req.session.touch(); // update cookie
      next();
    }catch(err){
      next(err);
    }
  }),

  'anonymous': coroutine( function *anonymousLiveSessionAuthorizeGen(req, res, next) {
    try{
      if (req.isAuthenticated()) {
        let browserSessionId = req.sessionID;
        if (!browserSessionId) {
          throw new Error('Unable to retrieve cookie.');
        }

        let entry = yield WhitelistEntry.findOne({
          user    : req.user._id,
          session : req.liveSession._id
        }).exec();

        if (!entry) {
          throw new Error ('Can\'t access this session');
        } else if (entry.browserSessionId !== browserSessionId) {
          entry.browserSessionId = browserSessionId;
          entry = yield entry.save();
        }

        req.whitelistEntry = entry;
        req.session.touch();
        next();
      } else {
        // TOOO throw could not authenticate error and handle it
        req.session.redirect_to = req.originalUrl;
        res.redirect('/login/');
      }
    }catch(err){
      next(err)
    }
  }),

  'private': coroutine( function *privateLiveSessionAuthorizeGen(req, res, next) {
    try{
      if (req.isAuthenticated()) {
        let browserSessionId = req.sessionID;
        if (!browserSessionId) {
          throw new Error('Unable to retrieve cookie.');
          return;
        }
        let entry = yield WhitelistEntry.findOne({
          user    : req.user._id,
          session : req.liveSession._id
        }).exec();

        if (!entry) {
          throw new Error ('Can\'t access this session');
        } else if (entry.browserSessionId !== browserSessionId) {
          entry.browserSessionId = browserSessionId;
          yield entry.save();
        }
        req.whitelistEntry = entry;
        req.session.touch();
        next();
      } else {
        // TOOO throw could not authenticate error and handle it
        req.session.redirect_to = req.originalUrl;
        res.redirect('/login/');
      }
    }catch(err){
      next(err)
    }
  })
};

/** Grant or deny access to the current session to potential viewers. */
function authorizeLiveSession(req, res, next) {
  liveSessionAuthorize[req.liveSession.authLevel](req, res, next);
}

function authorizePresenter(req, res, next){
  // something's up if there's no whitelistEntry
  if (typeof req.whitelistEntry === "undefined"){
    return next(Error.http(500), 'No whitelist entry', {type:'invalid_request_error'});
  }

  const role = req.whitelistEntry.validateRole('presenter'); 
  if(role !== 'presenter'){
    // we don't want to reveal that the page exists for the `presenter role`
    return res.render('404');
  }
  return next();
}

module.exports = {
  authorizeLiveSession : authorizeLiveSession,
  authorizePresenter : authorizePresenter
};
