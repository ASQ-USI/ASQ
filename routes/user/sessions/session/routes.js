var handlers   = require('./handlers')
  , appLogger = require('../../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting presentation routes');

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/edit/', middleware.isRouteOwner,
    handlers.editPresentation);

  app.post('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.startPresentation);

  app.delete('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.stopPresentation);

  app.get('/:user/presentations/:presentationId/live/:liveId', 
    middleware.authorizeLiveSession, handlers.livePresentation);

  app.get('/:user/presentations/:presentationId/live/:liveId/*', 
    middleware.authorizeLiveSession, handlers.livePresentationFiles);

  app.get('/:user/presentations/:presentationId/stats', 
     middleware.isRouteOwner, handlers.getPresentationStats);
}
