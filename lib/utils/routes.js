/** @module lib/utils/assessment.js
    @description Utilities for routes
*/


/**
 Get the CSS class for the alert box style
 @param {Object} req - An express request object
 @returns {String} The CSS class for the alert box
*/
function getAlertTypeClass(req){
  if (! req.query.type || ! (/(success|error|info)/g.test(req.query.type))) return '';

  //we have an alert-danger CSS rule
  var type = (req.query.type == 'error') ? 'alert-danger' : 'alert-' + type;
  return type;
  
}

module.exports = {
  getAlertTypeClass : getAlertTypeClass
}