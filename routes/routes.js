var handlers   = require('./handlers')
  , user      = require('./user')
  , appLogger = require('../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting root routes');
  // Get the home page
  app.get('/', handlers.getHomePage);

  //Get the register page
  app.get('/signup/', middleware.isNotAuthenticated, handlers.getSignup);

  //Register as a new user
  app.post('/signup', middleware.isNotAuthenticated, handlers.postSignup);

  //Get teh sign in page
  app.get('/login/', middleware.isNotAuthenticated, handlers.getLogin);

  //Sign in
  app.post('/login', middleware.localAuthenticate, handlers.postLogin);

  //Sign out
  app.post('/logout', middleware.isAuthenticated, handlers.logout);

  //Upload form
  app.get('/upload/', middleware.isAuthenticated, handlers.getUploadForm);

  //Set up routes starting with /:user/*
  user.setUp(app, middleware);
}
