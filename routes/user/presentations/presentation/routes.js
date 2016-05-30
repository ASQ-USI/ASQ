var handlers   = require('./handlers');
var logger     = require('logger-asq');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting presentation routes');

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/edit/', middleware.isRouteOwner,
    handlers.editPresentation);

  app.post('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.startPresentation);

  app.delete('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.terminatePresentation);

  app.get('/:user/presentations/:presentationId/live/:liveId', 
    middleware.authorizeLiveSession, handlers.livePresentation);

  app.get('/:user/presentations/:presentationId/live/:liveId/scoreboard', 
    middleware.authorizeLiveSession, handlers.getScoreboard);

  //static files
  app.get('/:user/presentations/:presentationId/live/:liveId/*', 
   handlers.livePresentationFiles);

  app.get('/:user/presentations/:presentationId/stats', 
    middleware.isRouteOwner, handlers.getPresentationStats);

  app.get('/:user/presentations/:presentationId/settings/', 
    middleware.isRouteOwner, handlers.getPresentationSettings);

}
