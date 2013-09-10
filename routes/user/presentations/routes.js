var handler      = require('./handler')
  , presentation = require('./presentation')
  , appLogger    = require('../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting presentations routes');

  // List all the user's presentations.
  app.get('/:user/presentations/', middleware.isRouteOwner,
    handler.listPresentations);
  
  // Upload a new presentation.
  app.post('/:user/presentations', middleware.isRouteOwner,
    handler.uploadPresentation);

  // Update the presentation matching presentationId.
  app.put('/:user/presentations/:presentationId', middleware.isRouteOwner,
      handler.updatePresentation);

  // Delete the presentation matching presentationId.
  app.del('/:user/presentations/:presentationId', middleware.isRouteOwner,
      handler.deletePresentation);

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/', middleware.isRouteOwner,
      handler.getPresentation);

  // Set up presentation specific routes
  // before the catchall (*) four lines below.
  presentation.setUp(app, middleware);

  // Serve static files attached to the slideshow
  app.get('/:user/presentations/:presentationId/*', middleware.isRouteOwner,
      handler.getPresentationFiles);
}