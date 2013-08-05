var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId;

var whitelistEntrySchema = new Schema({
	session : { type: ObjectId, ref: 'Session', required: true },
	uid : { type: ObjectId, ref: 'User', required: true },
	token : { type: String }, // Express Cookie session id
	canControl : { type: Boolean, default: false }
}, { collection: "whitelistEntries" });

whitelistEntrySchema.index({ session: 1, uid: 1});

mongoose.model("WhitelistEntry", whitelistEntrySchema);

module.exports = {
	whitelistEntrySchema : whitelistEntrySchema
}