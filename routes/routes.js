/** 
  * @module routes/routes
  * @description routes logic entry point
*/
'use strict';

var handlers = require('./handlers')
var user = require('./user');
var settingsRouter  = require('./user/settings');
var pluginsRouter  = require('./plugins');
var logger = require('logger-asq');
var config = require('../config');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting root routes');
  // Get the home page
  app.get('/', handlers.getHomePage);

  //Get the complete registration page
  app.get('/complete-registration/',
    middleware.isNotRegistrationComplete, handlers.getCompleteRegistration);

  //complete registration
  app.post('/complete-registration',
    middleware.isNotRegistrationComplete, handlers.postCompleteRegistration);

  //Get the register page
  app.get('/signup/', middleware.isNotAuthenticatedOrGoHome, handlers.getSignup);

  //Register as a new user
  app.post('/signup', middleware.isNotAuthenticatedOrGoHome, handlers.postSignup);

  //Get the login page
  app.get('/login/', middleware.setReferrerForRedirect,
     middleware.isNotAuthenticatedOrGoHome, handlers.getLogin);

  //Login
  app.post('/login', middleware.localAuthenticate, handlers.postLogin);

  // Ldap login
  if(config.enableLdap == true && "undefined" !== config.ldapOptions){
    //Get the campus login page
    app.get('/login-campus/', middleware.isNotAuthenticatedOrGoHome, handlers.getLoginCampus);

    //Login with campus
    app.post('/login-campus', middleware.ldapAuthenticate, handlers.postLoginCampus);
  }

  //Sign out
  app.post('/logout', middleware.isAuthenticated, handlers.logout);

  //Upload form
  app.get('/upload/', middleware.isAuthenticated, handlers.getUploadForm);

  // Check email availability
  app.get('/email_available/', handlers.emailAvailable);

  // Check username availability
  app.get('/username_available/', handlers.usernameAvailable);

  // Update live_viewer details
  app.put('/live_viewer', handlers.putLiveViewer);

  //Set up routes starting with /:user/*
  user.setUp(app, middleware);

  //settings router
  app.use('/:user/settings', middleware.isRouteOwner, settingsRouter)

  //plugins router
  app.use('/plugins', pluginsRouter)
}
