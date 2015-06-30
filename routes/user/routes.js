/** @module routes/user/routes
    @description routes for /:userid
*/
'use strict';

var handlers      = require('./handlers');
var presentations = require('./presentations');
var sessions      = require('./sessions');
var logger        = require('logger-asq');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting user routes');
  //Render the user page
  app.get('/:user/', handlers.getUserPage);

  //Render live presentations of user
  app.get('/:user/live/', handlers.getLivePresentations);

  presentations.setUp(app, middleware);
  sessions.setUp(app, middleware);
}
