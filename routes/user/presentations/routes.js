var handler = require('./handler');

module.exports.setUp = function setUp(app, authenticate) {
  // List all the user's presentations.
  app.get('/:user/presentations/', authenticate, handler.listPresentations);
  
  // Upload a new presentation.
  app.post('/:user/presentations/', authenticate, handler.uploadPresentation);
  
  // Get the presentation matching presentation-id.
  app.get('/:user/presentations/:presentation-id', authenticate,
      handler.getPresentation);
  
  // Update the presentation matching presentation-id.
  app.put('/:user/presentations/:presentation-id', authenticate,
      handler.updatePresentation);

  // Delete the presentation matching presentation-id.
  app.del('/:user/presentations/:presentation-id', authenticate,
      handler.deletePresentation);
}