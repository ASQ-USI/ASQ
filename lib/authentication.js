var slidesUtils = require('./slides-utils')
, utils         = require('./utils');

/**
 *  Authentication object for sessions
 *  it contains three middlewares, one for each level.
 */
var sessionAuthorize = {
	"public": function(req, res, next) {
		//TODO If the user is authenticated, add the token to the whitelist.
		// If the entrz is not in the whitelist, create it.
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			slidesUtils.sessionFromUsername(presenter, function(err, session){
				if (err) { throw err; }
				
				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : utils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : "TODO..." //TODO overwritte default to change
				}, {
					upsert : true
				},
				function(err, entry) {
						if(err) { throw err; }
						if (!entry) {
							res.redirect('/user/' + req.user.name 
								+ '/?alert=Something went wrong. The Great ASQ Server said: '
								+ 'You can\'t access this session.&type=error');
							return;
						}
						req.slideshow = session.slides;
						next();
				});
			});	
		} else {
			next();
		}
	},

	"anonymous": function(req, res, next) {
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			slidesUtils.sessionFromUsername(presenter, function(err, session){
				if (err) { throw err; }
				
				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : utils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : "anonymous generated name"
				}, {
					upsert : false
				},
				function(err, entry) {
						if(err) { throw err; }
						if (!entry) {
							res.redirect('/user/' + req.user.name 
								+ '/?alert=Something went wrong. The Great ASQ Server said: '
								+ 'You can\'t access this session &type=error');
							return;
						}
						req.slideshow = session.slides;
						next();
				});
			});	
		} else {
			req.session.redirect_to = req.originalUrl;
			res.redirect('/user');
		}
	},

	"private": function(req, res, next) {
		if (req.isAuthenticated()) {
			var presenter = req.params.user;
			slidesUtils.sessionFromUsername(presenter, function(err, session){
				if (err) { throw err; }

				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
				WhitelistEntry.findOneAndUpdate({
					uid     : req.user._id,
					session : session._id
				}, {
					token       : utils.getSessionFromCookie(req.headers.cookie), //what happens if this is null?
					displayName : req.user.name
				}, {
					upsert : false
				},
				function(err, entry) {
						if(err) { throw err; }
						if (!entry) {
							res.redirect('/user/' + req.user.name 
								+ '/?alert=Something went wrong. The Great ASQ Server said: '
								+ 'You can\'t access this session &type=error');
							return;
						}
						req.slideshow = session.slides;
						next();
				});
			});
		} else {
			req.session.redirect_to = req.originalUrl;
			res.redirect('/user');
		}
	}
}

/** Grant or deny access to the current session to potential viewers. */
var authorizeSession = function(req, res, next) {
	var userName = req.params.user;
	slidesUtils.sessionFromUsername(userName, function(err, session) {
		if (err) { throw err; }
 		sessionAuthorize[session.authLevel](req, res, next);
	})
}

// Socket auth
var ctrlAuthorize = function(handshakeData, callback) {
      
    // Check if the session was sent.
    if (!handshakeData.query || !handshakeData.query.sid) {
      process.nextTick( function(){
        callback(new Error("Missing session"), false);
      });
      return;
    }

    // check if cookie was sent.
    if (!handshakeData.headers || !handshakeData.headers.cookie) {
      process.nextTick( function(){
        callback(new Error("Not authenticated or missing cookie"), false);
      });
      return;
    }

    var token = utils.getSessionFromCookie(handshakeData.headers.cookie);
    // Check if cookie is valid.
    if (!token) {
      process.nextTick( function(){
        callback(new Error("Invalid cookie"), false);
      });
      return;
    }

    //Check if allowed ot join in
    var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid,
      canControl : true
    }, function(err, entry){
        if (err) { 
        	callback(err, false);
        	return;
        }
        if (!entry) {
          callback(new Error("Not authorized"), false);
          return;
        }
        var Session = db.model('Session', schemas.sessionSchema);
        Session.findById(handshakeData.query.sid, function(err, session) {
        	if (err) {
        		callback(err, false);
        		return;
        	}
        	if (!session) {
        		callback(new Error("Unable to find session"), false);
        	}
        	handshakeData.session = session;
        	handshakeData.displayName = entry.displayName;
        	callback(null, true);
        });
        
    });
 }

var authorizeLive = {
	"public" : function(handshakeData, callback) {
		if (handshakeData.session.isTerminated) {
			callback("Session is not live.", false);
			return;
		}
		handshakeData.displayName = "todo..."
		callback(null, true);
	},

	"anonymous" : function(handshakeData, callback) {
		// check if cookie was sent.
    if (!handshakeData.headers || !handshakeData.headers.cookie) {
      callback("Not authenticated or missing cookie", false);
      return;
    }

    var token = utils.getSessionFromCookie(handshakeData.headers.cookie);
    // Check if cookie is valid.
    if (!token) {
      callback("Invalid cookie", false);
      return;
    }

    //Check if allowed ot join in
    var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid
    }, function(err, entry){
        if (err) { callback(err, false); }
        if (!entry) {
          callback("Not authorized", false);
          return;
        }
        handshakeData.displayName = entry.displayName;
        callback(null, true);
    });
	},

	"private" : function(handshakeData, callback) {
		// check if cookie was sent.
    if (!handshakeData.headers || !handshakeData.headers.cookie) {
      callback("Not authenticated or missing cookie", false);
      return;
    }

    var token = utils.getSessionFromCookie(handshakeData.headers.cookie);
    // Check if cookie is valid.
    if (!token) {
      callback("Invalid cookie", false);
      return;
    }

    //Check if allowed ot join in
    var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid
    }, function(err, entry){
        if (err) { 
        	callback(err, false);
        	return;
        }
        if (!entry) {
          callback("Not authorized", false);
          return;
        }
        handshakeData.displayName = entry.displayName;
        callback(null, true);
    });
	}
}

var liveAuthorize = function(handshakeData, callback) {
	
	// Check if the session was sent.
  if (!handshakeData.query.sid) {
    callback("Missing session", false);
    return;
  }

  var Session = db.model('Session', schemas.sessionSchema);
  Session.findById(handshakeData.query.sid, '_id activeSlide authLevel', function(err, session) {
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