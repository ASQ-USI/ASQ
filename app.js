/**
    @fileoverview app main file, for initialization of the server
*/

//enhanced errors, useful for status codes, type etc
require('simple-errors');

var config = require('./config');
// Globals : mongoose, db, and schemas
mongoose   = require('mongoose');
db         = mongoose.createConnection(config.mongoDBServer, config.dbName, config.mongoDBPort);
schemas    = require('./models');

var cons          = require('consolidate')
, dust            = require('dustjs-helpers')
, express         = require('express')
, flash           = require('connect-flash')
, fs              = require('fs')
, mkdirp          = require('mkdirp')
, http            = require('http')
, path            = require('path')
, redisStore      = require('connect-redis')(express)
, slashes         = require('connect-slashes')
, microformat     = require('asq-microformat')
, credentials     = config.enableHTTPS ? {
    key                : fs.readFileSync(config.keyPath),
    cert               : fs.readFileSync(config.certPath),
    ca                 : fs.readFileSync(config.caPath),
    requestCert        : config.requestCert,
    rejectUnauthorized : config.rejectUnauthorized,
  } : {}
, lib             = require('./lib')
, appLogger       = lib.logger.appLogger
, authentication  = lib.authentication
, passport        = require('passport')
, editFunctions   = require('./routes/edit')
, errorMessages   = lib.errorMessages
, errorMiddleware = require('./routes/errorMiddleware')
, middleware      = require('./routes/middleware')
, registration    = require('./routes/registration')
, routes          = require('./routes')
, statistics      = require('./routes/statistics')
, validation      = require('./shared/validation');

//don't remove whitespace <- WUT?
dust.optimizers.format = function(ctx, node) { return node };
// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    if (req.url=="/") {
        res.render('index', {
        'message': req.flash('error'),
        'fromsignup': false
      });
    } else {
        res.redirect("/");
    }
    return false; //Ensure a value is always returned
}

//Set the process host and port if undefined.
process.env.HOST = process.env.HOST || config.host;
process.env.PORT = process.env.PORT || (config.enableHTTPS ? config.HTTPSPort : config.HTTPPort);
appLogger.log('ASQ initializing with host ' + process.env.HOST + ' on port ' + process.env.PORT);

app = express();



// Global namespace
var ASQ = global.ASQ = {};

//hostname which we want to advertise for connection.
ASQ.appHost = process.env.HOST;
clientsLimit = config.clientsLimit || 50;
appLogger.log('Clients limit: ' + clientsLimit);



//Reidrection to secure url when HTTPS is used.


/** Configure express */
app.configure(function() {

  //configure passport
  require('./lib/passport')(passport);

  app.set('port', process.env.PORT);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'dust');
  app.enable('view cache');
  app.engine('dust', cons.dust);
  //Setup Dust.js helpers and options
  lib.dustHelpers(dust);
  microformat.templates(dust);
  if (config.enableHTTPS) {
    app.use(middleware.forceSSL);
  }

  //make sure upload directory exists
  var uploadDir =  path.resolve(__dirname, config.uploadDir);
  if( ! fs.existsSync(uploadDir)){
    appLogger.debug("Creating uploadDir at ", uploadDir)
    mkdirp.sync(uploadDir);
  }
  app.set('uploadDir', uploadDir);
  app.use(express.bodyParser({uploadDir: app.get('uploadDir')}));
  app.use(express.static(path.join(__dirname, '/public/')));
  app.use(express.favicon(path.join(__dirname, '/public/favicon.ico')));
  app.use(express.logger('dev'));
 // app.use(express.methodOverride()); //Enable DELETE & PUT
  app.use(express.cookieParser());
  //redis store for session cookies
  var redisSessionStore = new redisStore({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
  });
  app.use(express.session({
    key : 'asq.sid',
    secret : 'ASQSecret',
    store  : redisSessionStore,
    // cookie : {
    //   maxAge : 2592000000 // 30 days
    // }
  }));
  app.set('sessionStore', redisSessionStore);
  //necessary initialization for passport plugin
  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(app.router);

  app.use(errorMiddleware.logErrors);
  app.param('user', middleware.isExistingUser);
  app.param('liveId', middleware.setLiveSession);
  app.use(slashes()); //Append slashes at the end of urls. (MUST BE at the end!)
});

app.configure('development', function(){
    app.use(errorMiddleware.errorHandler({showStack: true }));

    if (config.enableHTTPS) {
        //Passphrase should be entered at launch for production env.
        credentials.passphrase = fs.readFileSync('./ssl/pass-phrase.txt')
            .toString().trim();

    }
    validation.getErrorPassword = function devGetErrorPassword(candidate) {
      if (validator.isNull(candidate)) {
        return 'blank';
      }
      appLogger.debug('[devel mode] No password constraint');
      return null;
    }
});

app.configure('production', function(){
  app.use(errorMiddleware.errorHandler());
});

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
 });


/** Stop a user current session **/
app.get('/user/stop', ensureAuthenticated, routes.slides.stop);


/** Join the session of user */
app.get('/live/:user/', authentication.authorizeSession, routes.slides.live);
app.get('/live/:user/*', routes.slides.liveStatic);

/** Control your current session (if any) */
app.get('/admincontroll',  ensureAuthenticated, routes.slides.adminControll);
app.get('/admincontroll/*', ensureAuthenticated, routes.slides.adminStatic);
app.get('/admin/',  ensureAuthenticated, routes.slides.admin);
app.get('/admin/*', ensureAuthenticated, routes.slides.adminStatic);


app.get('/checkusername/:username/', registration.checkusername);


app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);


// Crash at start with node.js 0.10.10
// And why is the registration module involved in serving static files?
//Serving static files
//app.get('/images/:path/', registration.get);

app.get('/user/statistics/:id', ensureAuthenticated,  statistics.getSessionStats);

app.get('/user/edithtml/:id', ensureAuthenticated, editFunctions.edithtml);
app.get('/user/editstyle/:id', ensureAuthenticated, editFunctions.editstyle);
app.post('/user/edithtml/:id', ensureAuthenticated, editFunctions.savehtml);
app.post('/user/editstyle/:id', ensureAuthenticated, editFunctions.savestyle);
app.post('/user/savedetails/:id', ensureAuthenticated, editFunctions.saveDetails);

//Render presentations in iframe for thumbnails
app.get('/slidesInFrame/:id/', function(req,res){
  res.render('slidesIFrame', {user: req.user.name, id: req.params.id, url: req.query.url});
});

//Test call to create sample stats data
app.get('/stats/createSampleData', statistics.createSampleData)

//Request statistical data for Google Chart
app.get('/stats/getStats', statistics.getStats)

//Render test page
app.get('/test/perQuestion',function(req, res){ res.render('test', {questionId: req.query.questionId})});

routes.setUp(app, middleware);

/** HTTP(S) Server */
if (config.enableHTTPS && !config.usingReverseProxy) {
  var server = require('https').createServer(credentials, app).listen(app.get('port'), function(){
      appLogger.log("ASQ HTTPS server listening on port " + app.get('port') + " in " + app.get('env') + " mode");
  });
  var serverHTTP = http.createServer(app).listen(config.HTTPPort, function() {
      appLogger.log("HTTP redirection ready, listening on port " + config.HTTPPort);
  });
} else {
  var server = http.createServer(app).listen(app.get('port'), '0.0.0.0', function(){
    appLogger.info("ASQ HTTP server listening on port " + app.get('port') + " in " + app.get('env') + " mode");
  });
}

// to generate urls from the rest of the app we need the following info
if(config.usingReverseProxy){
  var opts = config.reverseProxyOptions;
  ASQ.protocol = opts.secure 
    ? "https"
    : "http";
  ASQ.port = (opts.port && parseInt(opts.port) !== 80) 
  ? opts.port
  : "";
  ASQ.host = opts.host
}else{
  ASQ.protocol = config.enableHTTPS
    ? "https"
    : "http";
  ASQ.port = app.get('port')
  ASQ.host = config.host;
}

ASQ.rootUrl = ASQ.protocol +"://" + ASQ.host + ":" + ASQ.port

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('./lib/sockets').listen(server);
