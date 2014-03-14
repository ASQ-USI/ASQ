/** @module models/user
    @description the User Model
*/

var mongoose   = require('mongoose')
, generateName = require('sillyname')
, Schema       = mongoose.Schema
, ObjectId     = Schema.ObjectId
, extend       = require('mongoose-schema-extend')
, bcrypt       = require('bcrypt')
, SALT_WORK_FACTOR = 10;


var baseUserSchema = new Schema({
  screenName: {type: String, default: generateName, required: true}
},
  { collection: 'users', discriminatorKey: '_type' });

var registeredUserSchema = baseUserSchema.extend({
  name: { type: String, unique: true, sparse: true, required: true },
  password: { type: String, required: true},
  email: { type:String, required: true },
  slides: { type: [ObjectId], default: [] }, //FIXME: rename me and make syntax like liveSessions
});

registeredUserSchema.pre('save', function(next) {
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

registeredUserSchema.methods.isValidPassword = function(candidate, callback) {
  bcrypt.compare(candidate, this.password, function(err, isMatch) {
    if (err) return callback(err);

    callback(null, isMatch);
  });
};

// Temporary user with public sessions
var guestUserSchema = baseUserSchema.extend({
  token : { type: String }, //Express cookie (for now...)
  createdAt: {type: Date, default: Date.now, expires: 2592000000 } //TTL of 30 days for guest users
});

mongoose.model('User', registeredUserSchema);
mongoose.model('GuestUser', guestUserSchema);

module.exports = {
  registeredUserSchema : registeredUserSchema,
  guestUserSchema      : guestUserSchema
};