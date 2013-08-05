var slidesUtils = require('./slides-utils')
, utils         = require('./utils');

/**
 *  Authentication object for sessions
 *  it contains three middlewares, one for each level.
 */
var sessionAuthorize = {
	"public": function(req, res, next) {
		console.log("New viewer joining public session.");
		//TODO If the user is authenticated, add the token to the whitelist.
		// If the entrz is not in the whitelist, create it.
		next();
	},

	"anonymous": function(req, res, next) {
		console.log("New viewer joining anonymous session.");
		if (req.isAuthenticated()) {
			var userName = req.params.user;
			slidesUtils.sessionFromUsername(userName, function(err, session){
				if (err) { throw err; }
				
				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry', schemas.WhitelistEntrySchema);
				WhitelistEntry.findOne({
					uid     : req.user._id,
					session : session._id
				}, function(err, entry) {
						if(err) { throw err; }
						if (!entry) {
							res.redirect('/user/' + req.user.name 
								+ '/?alert=Something went wrong. The Great ASQ Server said: '
								+ 'You can\'t access this session &type=error');
							return;
						}
						entry.token = utils.getSessionFromCookie(req.headers.cookie);
						entry.displayName = "anonymous!"; //Implement random name generator here!
						entry.save(function(err) {
							if (err) { throw err; }
							req.slideshow = session.slides;
							next();
						});
				});
			});
		} else {
			console.log("Setting redirect for " + req.originalUrl);
			req.session.redirect_to = req.originalUrl;
			res.redirect('/user');
		}
	},

	"private": function(req, res, next) {
		console.log("New viewer joining private session.");
		if (req.isAuthenticated()) {
			var userName = req.params.user;
			sessionFromUsername(userName, function(err, session){
				if (err) { throw err; }

				// Find if user is in list and update token
				var WhitelistEntry = db.model('WhitelistEntry', schemas.WhitelistEntrySchema);
				WhitelistEntry.findOne({
					uid     : req.user._id,
					session : session
				}, function(err, entry) {
						if(err) { throw err; }
						if (!entry) {
							res.redirect('/user/' + req.user.name 
								+ '/?alert=Something went wrong. The Great ASQ Server said: '
								+ 'You can\'t access this session &type=error');
							return;
						}
						entry.token = utils.getSessionFromCookie(req.headers.cookie);
						entry.displayName = userName;
						entry.save(function(err) {
							if (err) { throw err; }
							req.slideshow = session.slides;
							next();
						});
				});
			});
		} else {
			console.log("Setting redirect for " + req.originalUrl);
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
    if (!handshakeData.query.sid) {
      callback("Missing session", false);
      return;
    }

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
    var WhitelistEntry = db.model('WhitelistEntry', schemas.WhitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid,
      canControl : true
    }, function(err, entry){
        if (err) { throw err; }
        if (!entry) {
          callback("Not authorized", false);
          return;
        }
        console.log('New admin authorized');
        callback(null, true);
    });
 }

var authorizeLive = {
	"public" : function(handshakeData, callback) {
		console.log('New viewer authorized');
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
    var WhitelistEntry = db.model('WhitelistEntry', schemas.WhitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid,
      canControl : true
    }, function(err, entry){
        if (err) { throw err; }
        if (!entry) {
          callback("Not authorized", false);
          return;
        }
        console.log('New viewer authorized');
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
    var WhitelistEntry = db.model('WhitelistEntry', schemas.WhitelistEntrySchema);
    WhitelistEntry.findOne({
      token      : token,
      session    : handshakeData.query.sid,
      canControl : true
    }, function(err, entry){
        if (err) { throw err; }
        if (!entry) {
          callback("Not authorized", false);
          return;
        }
        console.log('New viewer authorized');
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
  Session.findById(handshakeData.query.sid, function(err, session) {
  	if (err) { throw err; }
  	authorizeLive[session.authLevel](handshakeData, callback);
  });	
}

module.exports = {
	authorizeSession : authorizeSession,
	ctrlAuthorize    : ctrlAuthorize,
	liveAuthorize    : liveAuthorize
}