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

  //static files
  app.get('/:user/presentations/:presentationId/live/:liveId/*', 
   handlers.livePresentationFiles);

  app.get('/:user/presentations/:presentationId/stats', 
    middleware.isRouteOwner, handlers.getPresentationStats);

  app.get('/:user/presentations/:presentationId/settings/', 
    middleware.isRouteOwner, handlers.getPresentationSettings);

  app.put('/:user/presentations/:presentationId/settings/', 
    middleware.isRouteOwner, handlers.putPresentationSettings);

  // ZHENFEI: clean this up
  // app.post('/:user/presentations/:presentationId/settings/save/exerciseconf', 
  //   middleware.isRouteOwner, handlers.configurePresentationSaveExercise);

  // app.post('/:user/presentations/:presentationId/settings/save/exerciseconfruntime', 
  //   middleware.isRouteOwner, handlers.configurePresentationSaveExerciseRuntime);

  // app.post('/:user/presentations/:presentationId/settings/save/slideshowconf', 
  //   middleware.isRouteOwner, handlers.configurePresentationSaveSlideshow);
}
