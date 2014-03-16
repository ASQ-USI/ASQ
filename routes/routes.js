var handlers   = require('./handlers')
  , user      = require('./user')
  , appLogger = require('../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting root routes');
  // Get the home page
  app.get('/', handlers.getHomePage);

  //Get the register page
  app.get('/register/', middleware.isNotAuthenticated, handlers.getRegister);

  //Register as a new user
  app.post('/register', middleware.isNotAuthenticated, handlers.postRegister);

  //Get teh sign in page
  app.get('/sign_in/', middleware.isNotAuthenticated, handlers.getSignIn);

  //Sign in
  app.post('/sign_in', middleware.localAuthenticate, handlers.postSignIn);

  //Sign out
  app.post('/sign_out', middleware.isAuthenticated, handlers.signOut);

  //Upload form
  app.get('/upload/', middleware.isAuthenticated, handlers.getUploadForm);

  //Set up routes starting with /:user/*
  user.setUp(app, middleware);
}
