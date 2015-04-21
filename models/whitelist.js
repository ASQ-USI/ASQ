var check   = require('validator').check
, mongoose  = require('mongoose')
, Schema    = mongoose.Schema
, ObjectId  = Schema.ObjectId
, appLogger = require('../lib/logger').appLogger;

var roles = {};
roles.banned    = 0;
roles.viewer    = 1;
roles.assistant = 2;
roles.presenter = 3;
roles.ghost = 4;


var whitelistEntrySchema = new Schema({
	session          : { type: ObjectId, ref: 'Session', required: true },
  sessionData      : { type: {} },
	user             : { type: ObjectId, ref: 'User', required: true },
	browserSessionId : { type: String }, // Express Cookie session id
  joinDate       : { type: Date, required: true, default: Date.now },
	screenName       : { type: String, required: true },
	role             : { type: String, default: 'viewer', enum: Object.keys(roles) }
}, { collection: 'whitelistEntries' });

whitelistEntrySchema.index({ session: 1, user: 1 });

/*
 * Check if the user is allowed to use the given role.
 * @param role the role the user wants to use.
 */
whitelistEntrySchema.methods.validateRole = function validateRole(role) {
  appLogger.debug('Check role');
  if (!roles.hasOwnProperty(role)) {
    return 'viewer';
  } else {
    appLogger.debug('Comparing roles: ' + roles[role] + ' ' + roles[this.role]);
    return roles[role] > roles[this.role] ? this.role : role;
  }
};

appLogger.debug('Loading WhitelistEntry');
mongoose.model('WhitelistEntry', whitelistEntrySchema);

module.exports = mongoose.model('WhitelistEntry');
