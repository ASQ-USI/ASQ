/** @module models/user
    @description the User Model
*/

var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId

userSchema = new Schema({
	name: { type: String, unique:true },
	password: { type: String },
	email: {type:String},
	slides: {type: [ObjectId], default: []},
	current: {type: ObjectId, default: null}
});

mongoose.model("User", userSchema);

module.exports = {
	userSchema : userSchema
}