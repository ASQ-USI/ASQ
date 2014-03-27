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
    dn: { type: String , unique: true, sparse: true, required: false },
    sAMAccountName: { type: String, unique: true, sparse: true, required: false }
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
  var errMsg = 'Incorrect username/email and password combination.'
    , criteria = (username.indexOf('@') === -1) 
      ? {username: username , password: { $exists: true}} 
      : {email: username , password: { $exists: true}};

    this.findOne(criteria, function(err, user){
    if(err) {return done(err)};
    if(!user) {return done(null, false, { message : errMsg })};
   
    user.isValidPassword(password, function(err, isMatch) {
      if (err) { return done(err); }
      if (!isMatch) { return done(null, false, { message: errMsg }); }
      return done(null, user);
    });;
  });
};

registeredUserSchema.statics.createOrAuthenticateLdapUser = function(ldapUser, done) {
  this.findOne({"ldap.dn" : ldapUser.dn}, function(err, dbuser){
    if (err) { return done(err); }

    //user was found just log him in
    if (dbuser) {
      return done(null, dbuser); 
    } else {
      // will create user but registration is 
      // incomplete without an ASQ username
      var User = db.model('User', schemas.registeredUserSchema)
        , newUser = new User();

      newUser.ldap.dn = ldapUser.dn;
      newUser.ldap.sAMAccountName = ldapUser.sAMAccountName;
      newUser.screenName = ldapUser.cn;
      newUser.firstname = ldapUser.givenName || newUser.ldap.username;
      newUser.lastname = ldapUser.sn || newUser.ldap.username;

      newUser.save(function(err, savedUser){
         if (err) { return done(err, null); }
         return done(null, savedUser); 
      })
    }
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