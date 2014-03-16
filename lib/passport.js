var passport      = require('passport')
  , LocalStrategy = require('passport-local').Strategy;


function init() {
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

  passport.use(new LocalStrategy(
    function(username, password, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
      var User = db.model('User', schemas.userSchema);
      var out = User.findOne({ username: username }, function (err, user) {
          if (err) { return done(err); }
          if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
          user.isValidPassword(password, function(err, isMatch) {
              if (err) { return done(err); }
              if (!isMatch) { return done(null, false, { message: 'Invalid password' }); }
              return done(null, user);
          });
        });
      });
    }
  ));

  return passport;
}

module.exports.init = init;