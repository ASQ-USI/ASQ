var handlers     = require('./handlers');
// var question = require('./question');
var logger       = require('logger-asq');

module.exports.setUp = function setUp(app, middleware) {
  logger.debug('Setting up question routes');

  // List all the user's presentations.
  app.get('/:user/questions/', middleware.isRouteOwner,
    handlers.listQuestions);
  
  // // Upload a new presentation.
  // app.post('/:user/question', middleware.isRouteOwner,
  //   handlers.createQuestion);

  // // Update the question matching questionId. 
  // // If it doesn't exist we create a new one using the upload handler
  // app.put('/:user/questionss/:questionsId', middleware.isRouteOwner,
  //   handlers.validatePutParams, handlers.putPresentation, handlers.uploadPresentation);

  // // Delete the question matching questionId.
  // app.delete('/:user/questions/:questionId', middleware.isRouteOwner,
  //   handlers.deletePresentation);

  // // Get the question matching questionId.
  // app.get('/:user/questions/:questionId/', middleware.isRouteOwner,
  //   handlers.getQuestion);

  // Set up question specific routes
  // before the catchall (*) four lines below.
  // question.setUp(app, middleware);
}
