var handlers     = require('./handlers');
var presentation = require('./presentation');
var logger       = require('logger-asq');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting presentations routes');

  // List all the user's presentations.
  app.get('/:user/presentations/', middleware.isRouteOwner,
    handlers.listPresentations);
  
  // Upload a new presentation.
  app.post('/:user/presentations', middleware.isRouteOwner,
    handlers.uploadPresentation);

  // Update the presentation matching presentationId. 
  // If it doesn't exist we create a new one using the upload handler
  app.put('/:user/presentations/:presentationId', middleware.isRouteOwner,
    handlers.validatePutParams, handlers.putPresentation, handlers.uploadPresentation);

  // Delete the presentation matching presentationId.
  app.delete('/:user/presentations/:presentationId', middleware.isRouteOwner,
    handlers.deletePresentation);

  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/', middleware.isRouteOwner,
    handlers.getPresentation);

  // Set up presentation specific routes
  // before the catchall (*) four lines below.
  presentation.setUp(app, middleware);

  // Serve static files attached to the slideshow
  app.get('/:user/presentations/:presentationId/*',
    middleware.isRouteOwner, handlers.getPresentationFiles);
}
