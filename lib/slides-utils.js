var schemas = require('../models');

var authentify ={
	"public": function(req, res, next) {
		console.log("New viewer joining public session.");
		next();
	},

	"anonymous": function(req, res, next) {
		console.log("New viewer joining anonymous session.");
		if (req.isAuthenticated()) {
			next();
		
		} else {
			console.log("Setting redirect for " + req.originalUrl);
			req.session.redirect_to = req.originalUrl;
		}
	},

	"private": function(req, res, next) {
		console.log("New viewer joining private session.");
		if (req.isAuthenticated()) {
			next();
		
		} else {
			console.log("Setting redirect for " + req.originalUrl);
			req.session.redirect_to = req.originalUrl;
		}
	}
}

var generateWhitelist ={
	"public": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for public presentation');
		return callback(null);
	},

	"anonymous": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for anonymous presentation');
		var WhitelistEntry = db.model('AnonymousWhitelist', schemas.AnonymousWhitelistSchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter;
		whitelistEntry.token = "mySecretToken";
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	},

	"private": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for private presentation');
		var WhitelistEntry = db.model('PrivateWhitelist', schemas.privateWhitelistSchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter;
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	}
}

module.exports = {
	authentify : authentify,
	generateWhitelist : generateWhitelist
}