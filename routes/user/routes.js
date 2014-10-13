var handlers       = require('./handlers')
  , presentations = require('./presentations')
  , sessions = require('./sessions')
  , appLogger     = require('../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting user routes');
  //Render the user page
  app.get('/:user/', handlers.getUserPage);

    //Update the user settings
  app.get('/:user/live/', handlers.getLivePresentations);
  
  //Render the user settings
  app.get('/:user/settings/', middleware.isRouteOwner, handlers.getUserSettings);
  
  //Update the user settings
  app.put('/:user/settings', middleware.isRouteOwner,
    handlers.updateUserSettings);

  presentations.setUp(app, middleware);
  sessions.setUp(app, middleware);
}
