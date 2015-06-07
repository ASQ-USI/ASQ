/**
    @fileoverview routes/errorMiddleware.js
    @description error handling middleware
*/
var appLogger       = require('../lib/logger').appLogger
  , errorTypes = require('./errorTypes');

function logErrors(err, req, res, next) {
  appLogger.error(err.stack);
  next(err);
}

// Modified from https://gist.github.com/mikevalstar/1633632
function errorHandler(options){
  options = options || {};
  // defaults
  var showStack = options.showStack
    , showMessage = options.showMessage
    , dumpExceptions = options.dumpExceptions
 
  return function errorHandler(err, req, res, next){

    if(err.message =='Could not authenticate'){
      return res.render('404');
    }

    // http://www.senchalabs.org/connect/errorHandler.html
    if (err.status) res.statusCode = err.status;
    if (res.statusCode < 400) res.statusCode = 500;

    // http://www.senchalabs.org/connect/errorHandler.html
    var stackArr = (err.stack || '').split('\n').slice(1)
   
    if(dumpExceptions) console.error(err.stack);

    if(showStack) {
      // html
      if (req.accepts('html')) {
        res.render('500', {
          error: err.toString(),
          stack:stackArr,
          statusCode:res.statusCode
          });
      // json
      } else if (req.accepts('json')) {
        res.json({
          "type": err.type || 'api_error',
          "message": err.message || 'something went wrong on ASQ\'s end',
          "stack" : err.stack
        });
      // plain text
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end(stackArr);
      }
    }else{
      // if we don't show the stack, we don't want
      // to reveal errors tat are not in the errorTypes list
      var noStackErrorType = 'api_error'
        , noStackErrorMessage ='something went wrong on ASQ\'s end';

      if(errorTypes.hasType(err.type)){
        noStackErrorType = err.type;
        noStackErrorMessage = err.message;
      }

      // public error page render
      // html
      if (req.accepts('html')) {
      res.render('500', {
        error: err.toString(),
        statusCode:res.statusCode
        });
    // json
      } else if (req.accepts('json')) {
        res.json({
          "type": noStackErrorType,
          "message": noStackErrorMessage
        });
      // plain text
      } else {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end("500 - Server Error");
      }
    }
  };
};


module.exports = {
  logErrors          : logErrors,
  errorHandler       : errorHandler
}