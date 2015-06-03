/** @module routes/user/routes
    @description routes for /:userid
*/
'use strict';

var handlers       = require('./handlers')
  , presentations = require('./presentations')
  , sessions = require('./sessions')
  , settings = require('./settings')
  , appLogger     = require('../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting user routes');
  //Render the user page
  app.get('/:user/', handlers.getUserPage);

  //Render live presentations of user
  app.get('/:user/live/', handlers.getLivePresentations);

  presentations.setUp(app, middleware);
  sessions.setUp(app, middleware);
  settings.setUp(app, middleware);
}
