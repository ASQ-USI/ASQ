var handlers       = require('./handlers')
  , presentations = require('./presentations')
  , appLogger     = require('../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting user routes');
  //Render the user page
  app.get('/:user/', handlers.getUserPage);
  
  //Render the user settings
  app.get('/:user/settings/', middleware.isRouteOwner, handlers.getUserSettings);
  
  //Update the user settings
  app.put('/:user/settings', middleware.isRouteOwner,
    handlers.updateUserSettings);

  presentations.setUp(app, middleware);
}