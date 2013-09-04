var handler       = require('./handler')
  , presentations = require('./presentations');

function setUp(app, middleware) {
  //Render the user page
  app.get('/:user/' handler.getUserPage);
  
  //Render the user settings
  app.get('/:user/settings/', middleware.isRouteOwner, handler.getUserSettings);
  
  //Update the user settings
  app.put('/:user/settings', middleware,isRouteOwner,
    handler.updateUserSettings);

  presentations.setUp(app, middleware);
}