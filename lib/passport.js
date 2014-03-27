/** @module lib/passprt
    @description setup passport
*/

var LocalStrategy = require('passport-local').Strategy
  , userModel = require('../models/user')
  , config = require('../config');
function init(passport) {
  // Passport session setup.
  //   To support persistent login sessions, Passport needs to be able to
  //   serialize users into a`nd deserialize users out of the session.  Typically,
  //   this will be as simple as storing the user ID when serializing, and finding
  //   the user by ID when deserializing.

  passport.serializeUser(function(user, done) {
    done(null, user._id);
  });

  passport.deserializeUser(function(id, done) {
    var User = db.model('User', schemas.userSchema);
    var out = User.findById(id, function (err, user) {
      if (user) {
          done(err, user);
      } else {
          done(null,new Error('User ' + id + ' does not exist'));
      }
    });
  });

  // Local Strategy
  passport.use("local-mongo", new LocalStrategy(
    function(username, password, done) {
      // asynchronous verification
      process.nextTick(function () {
        var User = db.model('User', schemas.registeredUserSchema);
        User.isValidUser(username, password, done);
      });
    }
  ));

  // Ldap Local Strategy
  if(config.enableLdap == true || "undefined" !== config.ldapOptions){  
    passport.use("local-ldap", new LocalStrategy(
      function(username, password, done) {
        // asynchronous verification
        process.nextTick(function () {
          require('./ldap').passportAuthenticateLDAP(username, password, done)
        });
      }
    ));
  }
}

module.exports = init;
