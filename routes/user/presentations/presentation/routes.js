var handler   = require('./handler')
  , appLogger = require('../../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting presentation routes');

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/edit/', middleware.isRouteOwner,
      handler.editPresentation);

  app.post('/:user/presentations/:presentationId/live/', handler.livePresentation);

  app.post('/:user/presentations/:presentationId/live/:liveId', 
    middleware.authorizeSession, handler.livePresentation);

  app.post('/:user/presentations/:presentationId/start/',
      middleware.isRouteOwner, handler.startPresentation);
}
