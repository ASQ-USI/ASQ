var handlers      = require('./handlers')
  , presentation = require('./presentation')
  , appLogger    = require('../../../lib/logger').appLogger;

module.exports.setUp = function setUp(app, middleware) {
  appLogger.debug('Setting presentations routes');

  // List all the user's presentations.
  app.get('/:user/presentations/', middleware.isRouteOwner,
    handlers.listPresentations);
  
  // Upload a new presentation.
  app.post('/:user/presentations', middleware.isRouteOwner,
    handlers.uploadPresentation);

  // Update the presentation matching presentationId.
  app.put('/:user/presentations/:presentationId', middleware.isRouteOwner,
      handlers.updatePresentation);

  // Delete the presentation matching presentationId.
  app.del('/:user/presentations/:presentationId', middleware.isRouteOwner,
      handlers.deletePresentation);

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/', middleware.isRouteOwner,
      handlers.getPresentation);

  // Set up presentation specific routes
  // before the catchall (*) four lines below.
  presentation.setUp(app, middleware);

  // Serve static files attached to the slideshow
  app.get('/:user/presentations/:presentationId/*', middleware.isRouteOwner,
      handlers.getPresentationFiles);
}