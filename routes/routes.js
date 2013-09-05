var handler   = require('./handler')
  , user      = require('./user')
  , appLogger = require('../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting root routes');
  // Get the home page
  app.get('/', handler.getHomePage);

  //Get the register page
  app.get('/register/', middleware.isNotAuthenticated, handler.getRegister);

  //Register as a new user
  app.post('/register', middleware.isNotAuthenticated, handler.postRegister);

  //Get teh sign in page
  app.get('/sign_in/', middleware.isNotAuthenticated, handler.getSignIn);

  //Sign in
  app.post('/sign_in', /*middleware.localAuthorize,*/ handler.postSignIn);

  //Sign out
  app.post('/sign_out', middleware.isAuthenticated, handler.signOut);

  //Set up routes starting with /:user/*
  user.setUp(app, middleware);
}