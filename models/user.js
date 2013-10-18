/** @module models/user
    @description the User Model
*/

var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId
, bcrypt	    = require('bcrypt')
, SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
	name: { type: String, unique: true },
	password: { type: String, required: true},
	email: { type:String, required: true },
	slides: { type: [ObjectId], default: [] },
	current: { type: ObjectId, default: null }
});

userSchema.pre('save', function(next) {
	var user = this;

	// return if the password was not modified.
	if (!user.isModified('password')) return next();

	bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
	    if (err) return next(err);

	    bcrypt.hash(user.password, salt, function(err, hash) {
	        if (err) return next(err);

	        user.password = hash;
	        next();
	    });
	});
});

userSchema.methods.isValidPassword = function(candidate, callback) {
	bcrypt.compare(candidate, this.password, function(err, isMatch) {
		if (err) return callback(err);

		callback(null, isMatch);
	})
}

mongoose.model("User", userSchema);

module.exports = {
	userSchema : userSchema
}