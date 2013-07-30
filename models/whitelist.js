var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId;


var anonymousWhitelistSchema = new Schema({
	session : { type: ObjectId, ref: 'Session', required: true },
	uid : { type: ObjectId, ref: 'User', required: true },
	token : {type: String, required: true }
}, {collection: "whitelistEntries" });

anonymousWhitelistSchema.index({ session: 1, uid: 1});

mongoose.model("AnonymousWhitelist", anonymousWhitelistSchema);

var privateWhitelistSchema = new Schema({
	session : { type: ObjectId, ref: 'Session', required: true },
	uid : { type: ObjectId, ref: 'User', required: true }
}, {collection: "whitelistEntries" });

privateWhitelistSchema.index({ session: 1, uid: 1});

mongoose.model("PrivateWhitelist", privateWhitelistSchema);

module.exports = {
	anonymousWhitelistSchema : anonymousWhitelistSchema,
	privateWhitelistSchema : privateWhitelistSchema
}

