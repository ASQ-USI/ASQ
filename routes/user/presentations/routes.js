var handler = require('./handler');

module.exports.setUp = function setUp(app, middleware) {
  // List all the user's presentations.
  app.get('/:user/presentations/', middleware.isRouteOwner,
    handler.listPresentations);
  
  // Upload a new presentation.
  app.post('/:user/presentations/', middleware.isRouteOwner,
    handler.uploadPresentation);
  
  // Get the presentation matching presentationId.
  app.get('/:user/presentations/:presentationId/', middleware.isRouteOwner,
      handler.getPresentation);

  // Serve static files attached to the slideshow
  app.get('/:user/presentations/:presentationId/*', middleware.isRouteOwner,
      handler.getPresentationFiles)
  
  // Update the presentation matching presentationId.
  app.put('/:user/presentations/:presentationId/', middleware.isRouteOwner,
      handler.updatePresentation);

  // Delete the presentation matching presentationId.
  app.del('/:user/presentations/:presentationId/', middleware.isRouteOwner,
      handler.deletePresentation);
}