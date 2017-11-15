/** @module lib/utils/presentation
    @description index for presentation related operations
*/

'use strict';

const Promise     = require("bluebird");
const coroutine   = Promise.coroutine;

const generateWhitelist = {
	public: coroutine(function *generatePublicWhiteListGen(sessionId, presenter, callback) {
		console.log('Generate whitelist for public presentation');
		const WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		const whitelistEntryPresenter = new WhitelistEntry();
		whitelistEntryPresenter.session = sessionId;
		whitelistEntryPresenter.user = presenter._id;
		whitelistEntryPresenter.screenName = presenter.screenName;
		whitelistEntryPresenter.role = 'presenter';
		yield whitelistEntryPresenter.save();

		const whitelistEntryGhost = new WhitelistEntry();
		whitelistEntryGhost.session = sessionId;
		whitelistEntryGhost.user = presenter._id;
		whitelistEntryGhost.screenName = presenter.screenName;
		whitelistEntryGhost.role = 'ghost';
		yield whitelistEntryGhost.save()

		return Promise.resolve(undefined);
	}),

	anonymous: coroutine(function *generateAnonymousWhiteListGen(sessionId, presenter, callback) {
		console.log('Generate whitelist for anonymous presentation');
		const WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		const whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.user = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		yield whitelistEntry.save();

		return Promise.resolve(undefined);
	}),

	private: coroutine(function *generatePrivateWhiteListGen(sessionId, presenter, callback) {
		console.log('Generate whitelist for private presentation');
		const WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		const whitelistEntry = new WhitelistEntry();
		whitelistEntry.session = sessionId;
		whitelistEntry.user = presenter._id;
		whitelistEntry.screenName = presenter.screenName;
		whitelistEntry.role = 'presenter';
		whitelistEntry.save();

		return Promise.resolve(undefined);
	})
}

/**
 * Return the sessionId if the given slideshow is actived by given user, otherwise return null
 * 
 * @method getSessionIfLiveByUser
 * @param ObjectId slideshowId   the slideshow's Id
 * @param ObjectId userId 
 * @return ObjectId return the sessionId if the given slideshow is actived by given user, otherwise return null
 */
const getSessionIfLiveByUser = coroutine(function* getSessionIfLiveByUserGen(userId, slideshowId) {
	const Session = db.model('Session');
  const query = {
    'presenter': userId,
    'slides': slideshowId,
    'endDate': null
  }

  const session = yield Session.findOne(query).exec();
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
const getLiveLink = function(username, slideshowId, sessionId) {
	return ['/', username,'/presentations/', 
					slideshowId, '/live/', 
					sessionId, '/?role=presenter&view=presentation'
				 ].join('');
}

module.exports = {
	generateWhitelist : generateWhitelist,
	getSessionIfLiveByUser: getSessionIfLiveByUser,
	getLiveLink: getLiveLink
}