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

    //Get the register page
  app.get('/signup-campus/', middleware.isNotAuthenticated, handlers.getSignupCampus);

  //Register as a new user
  app.post('/signup-campus', middleware.isNotAuthenticated, handlers.postSignupCampus);

  //Get the login page
  app.get('/login/', middleware.isNotAuthenticated, handlers.getLogin);

  //Login
  app.post('/login', middleware.localAuthenticate, handlers.postLogin);

  //Get the campus login page
  app.get('/login-campus/', middleware.isNotAuthenticated, handlers.getLoginCampus);

  //Login with campus
  app.post('/login-campus', middleware.ldapAuthenticate, handlers.postLoginCampus);

  //Sign out
  app.post('/logout', middleware.isAuthenticated, handlers.logout);

  //Upload form
  app.get('/upload/', middleware.isAuthenticated, handlers.getUploadForm);

  // Check email availability
  app.get('/email_available/', handlers.emailAvailable);

  // Check username availability
  app.get('/username_available/', handlers.usernameAvailable);

  //Set up routes starting with /:user/*
  user.setUp(app, middleware);
}
