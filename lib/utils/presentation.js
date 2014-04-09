/** @module lib/utils/presentation
    @description index for presentation related operations
*/

'use strict';

var cookie  = require('cookie')
	, when 		= require('when');

/** Given a userName, find it's current session **/
var sessionFromUsername = function(userName, callback) {
	var deferred = when.defer();

	var User = db.model('User', schemas.userSchema);
	User.findOne({ username : userName }).exec().then(
		function onUser(user) {
			if (!user) {
				return when.reject('User does not exist');
			}
			var Session = db.model('Session', schemas.sessionSchema);
			return Session.findById(user.current).populate('slides').exec();
		}).then(
		function onSession(session) {
			if (callback & (typeof(callback) == "function")) {
				callback(null, session);
			}
		}).then(null,
		function onError(err) {
			if (callback & (typeof(callback) == "function")) {
				callback(err, null);
			} else {
				deferred.reject(err);
			}
		});
		return deferred.promise;
};

var generateWhitelist = {
	"public": function generatePublicWhiteList(sessionId, presenter, callback) {
		console.log('Generate whitelist for public presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	},

	"anonymous": function generateAnonymousWhiteList(sessionId, presenter, callback) {
		console.log('Generate whitelist for anonymous presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	},

	"private": function generatePrivateWhiteList(sessionId, presenter, callback) {
		console.log('Generate whitelist for private presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.uid = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	}
}

module.exports = {
	generateWhitelist : generateWhitelist,
	sessionFromUsername : sessionFromUsername
}