var handlers      = require('./handlers')
  , appLogger    = require('../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting session routes');

  // Stats for specific session.
  app.get('/:user/sessions/:sessionId/stats', middleware.isRouteOwner,
    handlers.getSessionStats);
}
