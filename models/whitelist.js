var check    = require('validator').check
  , mongoose = require('mongoose')
  , Schema   = mongoose.Schema
  , ObjectId = Schema.ObjectId;

var roles = {};
roles['banned']    = 0;
roles['viewer']    = 1;
roles['assistant'] = 2;
roles['presenter'] = 3;

function setRole(role) {
  try {
    check(role, {
      isInt : 'not int',
      min   : 'too low',
      max   :  'too high'
    })
      .isInt()
      .min(0)
      .max(3)
  } catch (err) {
    if (err.message === 'not int') {
      try {
        check(role, {

        })
        .isString()
        
      }
    }
  }
  
}
var whitelistEntrySchema = new Schema({
	session : { type: ObjectId, ref: 'Session', required: true },
	uid : { type: ObjectId, ref: 'User', required: true },
	token : { type: String }, // Express Cookie session id
	displayName : { type: String },
	role : { type: Number, default: 1, min: 0, max: 3, set: setRole }
}, { collection: "whitelistEntries" });

whitelistEntrySchema.index({ session: 1, uid: 1 });

mongoose.model("WhitelistEntry", whitelistEntrySchema);

module.exports = {
	whitelistEntrySchema : whitelistEntrySchema
}