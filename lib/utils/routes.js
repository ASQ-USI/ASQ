/** @module lib/utils/assessment.js
    @description Utilities for routes
*/


/**
 * Get the CSS class for the alert box style
 * @param {Object} req - An express request object
 * @returns {String} The CSS class for the alert box
*/
function getAlertTypeClass(req){
  if (! req.query.type || ! (/(success|error|info)/g.test(req.query.type))) return '';

  //we have an alert-danger CSS rule
  var type = (req.query.type == 'error') ? 'danger' : type;
  return type;
  
}

/**
 * Redirect to the url stored in req.ression.redirect_to or to home
 * @param {Object} req - An express request object
 * @returns {String} The redirection URL
*/
function redirectToOrGoHome(req){
  var home = req.user.username 
    ? '/' + req.user.username + '/'
    : '/'
  
  var redirect_to = req.session.redirect_to || home ;
  delete req.session.redirect_to;
  return redirect_to
}

module.exports = {
  getAlertTypeClass : getAlertTypeClass,
  redirectToOrGoHome : redirectToOrGoHome
}