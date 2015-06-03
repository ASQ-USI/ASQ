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
, cookieParser    = require('cookie-parser')
, serveStatic     = require('serve-static')
, session         = require('express-session')
, favicon         = require('serve-favicon')
, morgan          = require('morgan')
, bodyParser      = require('body-parser')
, multer          = require('multer')
, flash           = require('connect-flash')
, fs              = require('fs')
, mkdirp          = require('mkdirp')
, http            = require('http')
, path            = require('path')
, redisStore      = require('connect-redis')(session)
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

app = express();
appLogger.log('ASQ initializing with host ' + config.host + ' on port ' + config.port);

// Global namespace
var ASQ = global.ASQ = {};

// to generate urls from the rest of the app we need the following info
ASQ.urlProtocol = config.urlProtocol;
ASQ.urlHost = config.urlHost;
ASQ.urlPort = config.urlPort;
ASQ.rootUrl = config.rootUrl;

app.locals.rootUrl = ASQ.rootUrl;

//hostname which we want to advertise for connection.
ASQ.appHost = config.host;
clientsLimit = config.clientsLimit || 50;
appLogger.log('Clients limit: ' + clientsLimit);


//Reidrection to secure url when HTTPS is used.


/** Configure express */
// app.enable('strict routing');
app.set("rootDir", __dirname);

//configure passport
require('./lib/passport')(passport);

app.set('port', config.port);
app.set('views', __dirname + '/views');
app.set('view engine', 'dust');
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
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ dest: app.get('uploadDir')}))

//static files
app.use(serveStatic(path.join(__dirname, '/public/'), {'index': 'false'}));
app.use(serveStatic(path.join(__dirname, '/public/bower_components/'), {'index': 'false'}));
app.use(serveStatic(path.join(__dirname, '/client/presenterControlPolymer/public/'), {'index': 'false'}));
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

app.use(morgan('dev'));
// app.use(express.methodOverride()); //Enable DELETE & PUT
app.use(cookieParser());
//redis store for session cookies
var redisSessionStore = new redisStore({
  host: '127.0.0.1',
  port: 6379,
  db: 0,
});
app.use(session({
  resave: true,
  saveUninitialized: false,
  store  : redisSessionStore,
  key : 'asq.sid',
  secret : 'ASQSecret'
  // cookie : {
  //   maxAge : 2592000000 // 30 days
  // }
}));
app.set('sessionStore', redisSessionStore);
//necessary initialization for passport plugin
app.use(passport.initialize());
app.use(flash());
app.use(passport.session());

app.use(errorMiddleware.logErrors);
app.param('user', middleware.isExistingUser);
app.param('liveId', middleware.setLiveSession);


if ('development' == app.get('env')) {
  app.use(errorMiddleware.errorHandler({showStack: true }));

  if (config.enableHTTPS) {
    //Passphrase should be entered at launch for production env.
    credentials.passphrase = fs.readFileSync('./ssl/pass-phrase.txt')
        .toString().trim();

  }
  validation.getErrorPassword = function devGetErrorPassword(candidate) {
    if (require('validator').isNull(candidate)) {
      return 'blank';
    }
    appLogger.debug('[devel mode] No password constraint');
    return null;
  }
};

if ('production' == app.get('env')) {
  app.enable('view cache');
  app.use(errorMiddleware.errorHandler());
};


// app.all('*', function(req, res, next) {
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Headers", "X-Requested-With");
//   next();
//  });


/** Stop a user current session **/
// app.get('/user/stop', ensureAuthenticated, routes.slides.stop);


// /** Join the session of user */
// app.get('/live/:user/', authentication.authorizeLiveSession, routes.slides.live);
// app.get('/live/:user/*', routes.slides.liveStatic);

// /** Control your current session (if any) */
// app.get('/admincontroll',  ensureAuthenticated, routes.slides.adminControll);
// app.get('/admincontroll/*', ensureAuthenticated, routes.slides.adminStatic);
// app.get('/admin/',  ensureAuthenticated, routes.slides.admin);
// app.get('/admin/*', ensureAuthenticated, routes.slides.adminStatic);


app.get('/checkusername/:username/', registration.checkusername);


// app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);


// // Crash at start with node.js 0.10.10
// // And why is the registration module involved in serving static files?
// //Serving static files
// //app.get('/images/:path/', registration.get);

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

routes.setUp(app, middleware);

// didn't match anything display 404
app.use(function(req, res, next){
  res.status(404);
  res.render('404', {'msg': 'Sorry cant find that!'});
});

app.get('/404', function(req, res, next){
  res.render('404');
});


//load plugins
var loader = require('./lib/plugin/loader');
loader.init()

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

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('./lib/socket/sockets').listen(server);
