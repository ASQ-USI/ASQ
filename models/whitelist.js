var check    = require('validator').check
  , mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var roles = {}
roles['banned']    = 0; 
roles['viewer']    = 1;
roles['assistant'] = 2;
roles['presenter'] = 3;


var whitelistEntrySchema = new Schema({
	session : { type: ObjectId, ref: 'Session', required: true },
	uid : { type: ObjectId, ref: 'User', required: true },
	token : { type: String }, // Express Cookie session id
	displayName : { type: String },
	role : { type: String, default: 'viewer', enum: Object.keys(roles) }
}, { collection: "whitelistEntries" });

whitelistEntrySchema.index({ session: 1, uid: 1 });

mongoose.model("WhitelistEntry", whitelistEntrySchema);

/*
 * Check if the user is allowed to use the given role.
 * @param role the role the user wants to use.
 */
whitelistEntrySchema.methods.validateRole = function validateRole(role) {
  if (!roles.hasOwnProperty(role)) {
    return 'viewer';
  } else {
    return roles[role] > roles[this.role] ? this.role : role;
  }
}

module.exports = {
	whitelistEntrySchema : whitelistEntrySchema
}