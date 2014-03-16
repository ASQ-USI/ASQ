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
  screenName: {type: String, default: function defName() {return generateName();} , required: true}
},
  { collection: 'users', discriminatorKey: '_type' });

var registeredUserSchema = baseUserSchema.extend({
  username: { type: String, unique: true, sparse: true, required: true, lowercase: true },
  password: { type: String, required: true },
  firstname: { type: String, required: true, set: capitalize }, //TODO add fields in signup form, fullname method and signup check on both client and server
  lastname: { type: String, required: true, set: capitalize },
  email: { type: String, required: true, sparse: true, unique: true }, // Exactly only one email per account
  slides: { type: [ObjectId], default: [] }, //FIXME: rename me and make syntax like liveSessions
});

registeredUserSchema.virtual('fullname').get(function getFullname() {
  return this.firstname + ' ' + this.lastname;
});

registeredUserSchema.methods.isValidPassword = function isValidPassword(candidate, callback) {
  bcrypt.compare(candidate, this.password, function onPwdCompare(err, isMatch) {
    if (err) return callback(err);

    callback(null, isMatch);
  });
};

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

// Temporary user with public sessions
var guestUserSchema = baseUserSchema.extend({
  token : { type: String }, //Express cookie (for now...)
  createdAt: {type: Date, default: Date.now, expires: 2592000000 } //TTL of 30 days for guest users
});

mongoose.model('User', registeredUserSchema);
mongoose.model('GuestUser', guestUserSchema);

function capitalize (val) {
  if ('string' != typeof val) val = '';
  return val.charAt(0).toUpperCase() + val.substring(1);
}

module.exports = {
  registeredUserSchema : registeredUserSchema,
  guestUserSchema      : guestUserSchema
};