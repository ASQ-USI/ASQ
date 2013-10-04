/** @module lib/authentication
    @description Authentication logic
*/

//TODO : make every token an array

var utils     = require('./utils')
  , presUtils = utils.presentation
  , authUtils = utils.auth
  , userCounter = 0;

/**
 *  Authentication object for sessions
 *  it contains three middlewares, one for each level.
 */
var sessionAuthorize = {
	'public': function publicSessionAuthorize(req, res, next) {
		//TODO If the user is authenticated, add the token to the whitelist.
		// If the entrz is not in the whitelist, create it.
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			presUtils.sessionFromUsername(presenter, function onSession(err, session){
				if (err) { 
                  next(err);
                }
				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry',
          schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : authUtils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : 'TODO...' //TODO overwritte default to change
				}, {
					upsert : true
				},
				function onEntry(err, entry) {
						if(err) { 
              next(err);
            }
						if (!entry) {
							return next(new Error('You can\'t access this session.'));
						}
						req.slideshow = session.slides;
            req.whitelistEntry = entry;
						next();
				});
			});	
		} else {
			next();
		}
	},

	'anonymous': function anonymousSessionAuthorize(req, res, next) {
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			presUtils.sessionFromUsername(presenter,
      function onSession(err, session){
				if (err) {
          return next(err);
        }
				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry',
          schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : authUtils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : 'anonymous generated name'
				}, {
					upsert : false
				},
				function onEntry(err, entry) {
						if(err) {
              return next(err);
            }
						if (!entry) {
							return next(new Error ('Can\'t access this session'));
						}
						req.slideshow = session.slides;
            req.whitelistEntry = entry;
						next();
				});
			});	
		} else {
			req.session.redirect_to = req.originalUrl;
			res.redirect('/sign_in/' );
		}
	},

	'private': function privateSessionAuthorize(req, res, next) {
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			presUtils.sessionFromUsername(presenter,
      function onSession(err, session){
				if (err) { 
          next(err);
        }

				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry',
          schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : authUtils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : req.user.name
				}, {
					upsert : false
				},
				function onEntry(err, entry) {
						if(err) { 
              next(err);
            }
						if (!entry) {
							return next(new Error ('Can\'t access this session'));
						}
						req.slideshow = session.slides;
            req.whitelistEntry = entry;
						next();
				});
			});
		} else {
			req.session.redirect_to = req.originalUrl;
			res.redirect('/sign_in/');
		}
	}
}

/** Grant or deny access to the current session to potential viewers. */
function authorizeSession(req, res, next) {
	var userName = req.params.user;
	presUtils.sessionFromUsername(userName, function(err, session) {
		if (err) { 
      return next(err);
    }
 		sessionAuthorize[session.authLevel](req, res, next);
	})
}

// Socket auth
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
  var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
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
      var Session = db.model('Session', schemas.sessionSchema);
      Session.findById(handshakeData.query.sid, function(err, session) {
      	if (err) {
      		return callback(err, false);
      	}
      	if (!session) {
      		return callback(new Error('Unable to find session'), false);
      	}
      	handshakeData.session = session;
      	handshakeData.displayName = entry.displayName;
      	callback(null, true);
      });
      
  });
}

var authorizeLive = {
	'public' : function publicLiveAuthorize(handshakeData, callback) {
		if (handshakeData.session.isTerminated) {
			callback('Session is not live.', false);
			return;
		}
		handshakeData.displayName = "user"+ (++userCounter).toString();
		callback(null, true);
	},

	'anonymous' : function anonymousLiveAuthorize(handshakeData, callback) {
		// check if cookie was sent.
    if (!handshakeData.headers || !handshakeData.headers.cookie) {
      callback('Not authenticated or missing cookie', false);
      return;
    }

    var token = authUtils.getSessionFromCookie(handshakeData.headers.cookie);
    // Check if cookie is valid.
    if (!token) {
      callback('Invalid cookie', false);
      return;
    }

    //Check if allowed ot join in
    var WhitelistEntry = db.model('WhitelistEntry',
      schemas.whitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid
    }, function(err, entry){
        if (err) { callback(err, false); }
        if (!entry) {
          callback('Not authorized', false);
          return;
        }
        handshakeData.displayName = entry.displayName;
        callback(null, true);
    });
	},

	'private' : function privateLiveAuthorize(handshakeData, callback) {
		// check if cookie was sent.
    if (!handshakeData.headers || !handshakeData.headers.cookie) {
      callback('Not authenticated or missing cookie', false);
      return;
    }

    var token = authUtils.getSessionFromCookie(handshakeData.headers.cookie);
    // Check if cookie is valid.
    if (!token) {
      callback('Invalid cookie', false);
      return;
    }

    //Check if allowed ot join in
    var WhitelistEntry = db.model('WhitelistEntry',
      schemas.whitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid
    }, function(err, entry){
        if (err) { 
        	callback(err, false);
        	return;
        }
        if (!entry) {
          callback('Not authorized', false);
          return;
        }
        handshakeData.displayName = entry.displayName;
        callback(null, true);
    });
	}
}

function liveAuthorize(handshakeData, callback) {
	
	// Check if the session was sent.
  if (!handshakeData.query.sid) {
    callback('Missing session', false);
    return;
  }

  var Session = db.model('Session', schemas.sessionSchema);
  Session.findById(handshakeData.query.sid, '_id activeSlide authLevel endDate',
  function onSession(err, session) {
  	if (err) { callback(err, false); }
  	handshakeData.session = session;
  	authorizeLive[session.authLevel](handshakeData, callback);
  });	
}

module.exports = {
	authorizeSession : authorizeSession,
	ctrlAuthorize    : ctrlAuthorize,
	liveAuthorize    : liveAuthorize
}
