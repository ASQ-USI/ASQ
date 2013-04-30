/**
 Middleware function to mock passport users for testing
*/

module.exports = {
  initialize: function(sessionUserObject) {
    return function(req, res, next) {
      var passport;
      passport = this;
      passport._key = 'passport';
      passport._userProperty = 'user';
      passport.serializeUser = function(user, done) {
        return done(null, user);
      };
      passport.deserializeUser = function(user, done) {
        return done(null, user);
      };
      req._passport = {
        instance: passport
      };
      req._passport.session = {
        user: sessionUserObject
      };
      return next();
    };
  }
};
