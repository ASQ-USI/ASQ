/** @module lib/utils/presentation
    @description index for presentation related operations
*/

'use strict';

var cookie  = require('cookie')
	, Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine
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
		var whitelistEntryPresenter = new WhitelistEntry();
		whitelistEntryPresenter.session = sessionId;
		whitelistEntryPresenter.user = presenter._id;
		whitelistEntryPresenter.screenName = presenter.screenName;
		whitelistEntryPresenter.role = 'presenter';
		whitelistEntryPresenter.save(function(err, savedWLP) {
			if(err) return callback(err);

			var whitelistEntryGhost = new WhitelistEntry();
			whitelistEntryGhost.session = sessionId;
			whitelistEntryGhost.user = presenter._id;
			whitelistEntryGhost.screenName = presenter.screenName;
			whitelistEntryGhost.role = 'ghost';
			whitelistEntryGhost.save(function(err, savedWLW) {
				return callback(err);
			});
		});
	},

	"anonymous": function generateAnonymousWhiteList(sessionId, presenter, callback) {
		console.log('Generate whitelist for anonymous presentation');
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		var whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.user = presenter._id;
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
		whitelistEntry.user = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		whitelistEntry.save(function(err, whitelistEntry) {
			return callback(err);
		});
	}
}

/**
 * Return the sessionId if the given slideshow is actived by given user, otherwise return null
 * 
 * @method getSessionIfLiveBy
 * @param ObjectId slideshowId   the slideshow's Id
 * @param ObjectId userId 
 * @return ObjectId return the sessionId if the given slideshow is actived by given user, otherwise return null
 */
var getSessionIfLiveBy = coroutine(function* getSessionIfLiveByGen(userId, slideshowId) {
	var Session = db.model('Session');
  var query = {
    'presenter': userId,
    'slides': slideshowId,
    'endDate': null
  }

  var session = yield Session.findOne(query).exec();
  if ( !session ) return null;
  return session._id
});

/**
 * Get the live link by given arguments.
 *
 * @method getLiveLink
 * @param  String username    
 * @param  ObjectId slideshowId 
 * @param  ObjectId sessionId   
 * @return String              The live link
 */
var getLiveLink = function(username, slideshowId, sessionId) {
	return ['/', username,'/presentations/', 
					slideshowId, '/live/', 
					sessionId, '/?role=presenter&view=presentation'
				 ].join('');
}

module.exports = {
	generateWhitelist : generateWhitelist,
	sessionFromUsername : sessionFromUsername,
	getSessionIfLiveBy: getSessionIfLiveBy,
	getLiveLink: getLiveLink
}