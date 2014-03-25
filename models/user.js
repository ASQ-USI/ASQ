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
  username: { type: String, unique: true, sparse: true, required: false, lowercase: true },
  password: { type: String, required: false },
  firstname: { type: String, required: true },
  lastname: { type: String, required: true },
  regComplete: {type:Boolean, required:true, default: false },
  email: { type: String, required: false, sparse: true, unique: true }, // Exactly only one email per account
  slides: { type: [ObjectId], default: [] }, //FIXME: rename me and make syntax like liveSessions
  ldap:{
    id: { type: String , unique: true, sparse: true, required: false },
    username: { type: String, unique: true, sparse: true, required: false }
  }
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

registeredUserSchema.statics.isValidUser = function(username, password, done) {
  var criteria = (username.indexOf('@') === -1) ? {username: username} : {email: username};
    this.findOne(criteria, function(err, user){
    if(err) {return done(err)};
    if(!user) {return done(null, false, { message : 'Incorrect username or email.' })};
   
    user.isValidPassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { message: 'Invalid password' }); }
      return done(null, user);
    });;
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

module.exports = {
  registeredUserSchema : registeredUserSchema,
  guestUserSchema      : guestUserSchema
};