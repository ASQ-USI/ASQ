/** 
  * @module app
  * @description ASQ main file, initiliazes the server
*/
'use strict';

//enhanced errors, useful for status codes, type etc
require('simple-errors');
var config = require('./config');
var appConfig = config.log.application;
var logger  = require('logger-asq');
logger.initialize({
  name: "app",
  streams: [
    {
       stream: process.stdout,
       level: appConfig.level
    },
    {
      level: appConfig.level,
      path:  appConfig.file
    }
  ]
});


// Globals : mongoose, db, and schemas
var Promise         = require('bluebird');
global.mongoose   = require('mongoose');
global.mongoose.Promise = Promise
global.db         = mongoose.createConnection(config.mongo.mongoUri);
global.schemas    = require('./models');

var coroutine       = Promise.coroutine;
var express         = require('express');
var fs              = require('fs');
var http            = require('http');
var middleware = require('./lib/middleware');
var Setting = db.model('Setting');
var settings = require('./lib/settings')

//SSL
var credentials     = config.enableHTTPS ? {
    key                : fs.readFileSync(config.keyPath),
    cert               : fs.readFileSync(config.certPath),
    ca                 : fs.readFileSync(config.caPath),
    requestCert        : config.requestCert,
    rejectUnauthorized : config.rejectUnauthorized,
  } : {};

var app = express();

var init = coroutine(function *initGen () {

  let server, serverHTTP;

  //setup middleware
  middleware(app);

  //use event denormalizer for CQRS
  require('./lib/denormalizer/');

  // make sure we have all settings populated
  yield Setting.populateDefaults();

  //load plugins
  var plugins = require('./lib/plugin/');
  yield plugins.init();

  var dbHash = yield settings.read('dbHash');
  if(dbHash == null){
    //database is new, we need to do some initialization
    yield settings.update('dbHash', mongoose.Types.ObjectId());
    var corePlugins = require('./package.json').asq.corePlugins;
    yield Promise.map(corePlugins, plugins.activatePlugin);
  }

  /** HTTP(S) Server */
  if (config.enableHTTPS && !config.usingReverseProxy) {
    server = require('https').createServer(credentials, app).listen(config.port, function(){
        logger.log("ASQ HTTPS server listening on port " + config.port + " in " + app.get('env') + " mode");
    });
    serverHTTP = http.createServer(app).listen(config.HTTPPort, function() {
        logger.log("HTTP redirection ready, listening on port " + config.HTTPPort);
    });
  } else {
    server = http.createServer(app).listen(config.port, '0.0.0.0', function(){
      logger.info("ASQ HTTP server listening on port " + config.port + " in " + app.get('env') + " mode");
    });
  }

   /** Socket.io Server */
  var io = require('./lib/socket').listen(server);

  // this function is called when you want the server to die gracefully
  // i.e. wait for existing connections
  var gracefulShutdown = function() {
    logger.log("Received kill signal, shutting down gracefully.");
    server.close(function() {
      logger.log("Closed out remaining connections.");
      process.exit()
    });
    
     // if it hasn't stopped after 10 seconds kill it
     setTimeout(function() {
        logger.error("Could not close connections in time, forcefully shutting down");
         process.exit()
    }, 10*1000);
  }

  // listen for TERM signal .e.g. kill 
  process.on ('SIGTERM', gracefulShutdown);
  // listen for INT signal e.g. Ctrl-C
  process.on ('SIGINT', gracefulShutdown); 

  process.on('uncaughtException', (err) => {
    logger.error({
      err: err,
      stacktrace: err.stack
    }, "uncaught error");
    gracefulShutdown();
  });
});



//fire things up
try{
  init();
}catch(err){
  throw err;
}

//TODO: THIS CODE NEEDS TO BE PORTED FOR 3.0.0

// var editFunctions   = require('./routes/edit');
// var statistics      = require('./routes/statistics');

// /** Control your current session (if any) */
// app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);


// app.get('/user/statistics/:id', ensureAuthenticated,  statistics.getSessionStats);

// app.get('/user/edithtml/:id', ensureAuthenticated, editFunctions.edithtml);
// app.get('/user/editstyle/:id', ensureAuthenticated, editFunctions.editstyle);
// app.post('/user/edithtml/:id', ensureAuthenticated, editFunctions.savehtml);
// app.post('/user/editstyle/:id', ensureAuthenticated, editFunctions.savestyle);
// app.post('/user/savedetails/:id', ensureAuthenticated, editFunctions.saveDetails);

// //Request statistical data for Google Chart
// app.get('/stats/getStats', statistics.getStats)
