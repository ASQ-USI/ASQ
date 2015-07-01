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
global.mongoose   = require('mongoose');
global.db         = mongoose.createConnection(config.mongoDBServer, config.dbName, config.mongoDBPort);
global.schemas    = require('./models');

var Promise         = require('bluebird');
var coroutine       = Promise.coroutine;
var express         = require('express');
var fs              = require('fs');
var http            = require('http');
var middleware = require('./lib/middleware');
var Setting = db.model('Setting');

//SSL
var credentials     = config.enableHTTPS ? {
    key                : fs.readFileSync(config.keyPath),
    cert               : fs.readFileSync(config.certPath),
    ca                 : fs.readFileSync(config.caPath),
    requestCert        : config.requestCert,
    rejectUnauthorized : config.rejectUnauthorized,
  } : {};

// var editFunctions   = require('./routes/edit');
// var statistics      = require('./routes/statistics');

var app = express();

var init = coroutine(function *initGen () {

  //setup middleware
  middleware(app);

  // make sure we have settings populated
  yield Setting.populateDefaults();

  //load plugins
  var plugins = require('./lib/plugin/');
  yield plugins.init();

  /** HTTP(S) Server */
  if (config.enableHTTPS && !config.usingReverseProxy) {
    var server = require('https').createServer(credentials, app).listen(config.port, function(){
        logger.log("ASQ HTTPS server listening on port " + config.port + " in " + app.get('env') + " mode");
    });
    var serverHTTP = http.createServer(app).listen(config.HTTPPort, function() {
        logger.log("HTTP redirection ready, listening on port " + config.HTTPPort);
    });
  } else {
    var server = http.createServer(app).listen(config.port, '0.0.0.0', function(){
      logger.info("ASQ HTTP server listening on port " + config.port + " in " + app.get('env') + " mode");
    });
  }

   /** Socket.io Server */
  var io = require('./lib/socket/sockets').listen(server);
});

//fire things up
try{
  init();
}catch(err){
  throw err;
}

// /** Control your current session (if any) */
// app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);


// app.get('/user/statistics/:id', ensureAuthenticated,  statistics.getSessionStats);

// app.get('/user/edithtml/:id', ensureAuthenticated, editFunctions.edithtml);
// app.get('/user/editstyle/:id', ensureAuthenticated, editFunctions.editstyle);
// app.post('/user/edithtml/:id', ensureAuthenticated, editFunctions.savehtml);
// app.post('/user/editstyle/:id', ensureAuthenticated, editFunctions.savestyle);
// app.post('/user/savedetails/:id', ensureAuthenticated, editFunctions.saveDetails);

// //Render presentations in iframe for thumbnails
// app.get('/slidesInFrame/:id/', function(req,res){
//   res.render('slidesIFrame', {user: req.user.name, id: req.params.id, url: req.query.url});
// });

// //Test call to create sample stats data
// app.get('/stats/createSampleData', statistics.createSampleData)

// //Request statistical data for Google Chart
// app.get('/stats/getStats', statistics.getStats)

// //Render test page
// app.get('/test/perQuestion',function(req, res){ res.render('test', {questionId: req.query.questionId})});
