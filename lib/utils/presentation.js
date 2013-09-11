/** @module lib/utils/presentation
    @description index for presentation related operations
*/

var schemas = require('../../models')
	, cookie    = require('cookie');

/** Given a userName, find it's current session **/
var sessionFromUsername = function(userName, callback) {
	var User = db.model('User', schemas.userSchema);
	User.findOne({ name : userName }, function(err, user) {
		if (err) { callback(err); }
		if (!user) {
			callback(new Error('User does not exist'));
		
		} else if (user.current) {
			var Session = db.model('Session', schemas.sessionSchema);
			Session.findById(user.current).populate('slides')
				.exec(function(err, session) {
					if (err) { return callback(err); }

					callback(null, session);
			});

		} else { //no session for user
			callback(null, {});
		}
	});
}

var generateWhitelist ={
	"public": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for public presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter;
		whitelistEntry.canControl = true;
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	},

	"anonymous": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for anonymous presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter;
		whitelistEntry.canControl = true;
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	},

	"private": function(sessionId, presenter, callback) {
		console.log('Generate whitelist for private presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter;
		whitelistEntry.canControl = true;
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	}
}

module.exports = {
	generateWhitelist : generateWhitelist,
	sessionFromUsername : sessionFromUsername
}