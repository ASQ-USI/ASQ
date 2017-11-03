var handlers   = require('./handlers');
var logger     = require('logger-asq');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting presentation routes');

  //download zip
  app.get('/:user/presentations/:presentationId/download/', middleware.isRouteOwner,
    handlers.downloadPresentation);

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/edit/', middleware.isRouteOwner,
    handlers.editPresentation);

  app.post('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.createLivePresentation);

  app.delete('/:user/presentations/:presentationId/live',
    middleware.isRouteOwner, handlers.terminatePresentation);

  app.get('/:user/presentations/:presentationId/live/:liveId', 
    middleware.authorizeLiveSession, handlers.livePresentation);

  // this has to be before static files
  app.get('/:user/presentations/:presentationId/live/:liveId/cockpit', 
    middleware.authorizeLiveSession, middleware.authorizePresenter, handlers.liveCockpit);
  // this has to be before static files
  app.get('/:user/presentations/:presentationId/live/:liveId/cockpit/*', 
    middleware.authorizeLiveSession, middleware.authorizePresenter, handlers.liveCockpit);

  //static files
  app.get('/:user/presentations/:presentationId/live/:liveId/*', 
   handlers.livePresentationFiles);

  app.get('/:user/presentations/:presentationId/stats', 
    middleware.isRouteOwner, handlers.getPresentationStats);

  app.get('/:user/presentations/:presentationId/settings/', 
    middleware.isRouteOwner, handlers.getPresentationSettings);

}
