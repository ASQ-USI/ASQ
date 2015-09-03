/** 
  * @module lib/middleware/index
  * @description attaches middleware to the server
*/
var logger          = require('logger-asq');
var config          = require('../../config');
var cons            = require('consolidate');
var dust            = require('dustjs-helpers');
var express         = require('express');
var cookieParser    = require('cookie-parser');
var serveStatic     = require('serve-static');
var session         = require('express-session');
var favicon         = require('serve-favicon');
var morgan          = require('morgan');
var bodyParser      = require('body-parser');
var multer          = require('multer');
var flash           = require('connect-flash');
var fs              = require('fs');
var mkdirp          = require('mkdirp');
var path            = require('path');
var redisStore      = require('connect-redis')(session);
// var microformat     = require('asq-microformat');
var credentials     = config.enableHTTPS ? {
    key                : fs.readFileSync(config.keyPath),
    cert               : fs.readFileSync(config.certPath),
    ca                 : fs.readFileSync(config.caPath),
    requestCert        : config.requestCert,
    rejectUnauthorized : config.rejectUnauthorized,
  } : {};
var lib             = require('../');

var passport        = require('passport');
var errorMiddleware = require('./errorMiddleware');
var middleware      = require('./middleware');
var registration    = require('../../routes/registration');
var routes          = require('../../routes');
var validation      = require('../../shared/validation');

var Setting = db.model('Setting');



function setupMiddleware (asqApp) {

  //don't remove whitespace 
  dust.config.whitespace = true;


  //locals to templates (also available through req.app.locals)
  asqApp.locals.urlProtocol = config.urlProtocol;
  asqApp.locals.urlHost = config.urlHost;
  asqApp.locals.urlPort = config.urlPort;
  asqApp.locals.rootUrl = config.rootUrl;
  asqApp.locals.host = config.host;


  /** Configure express */
  var rootDir =  config.rootDir;

  //configure passport
  require('../passport')(passport);

  asqApp.set('views', path.join(rootDir, 'views'));
  asqApp.set('view engine', 'dust');
  asqApp.engine('dust', cons.dust);
  //Setup Dust.js helpers and options
  lib.dustHelpers(dust);
  if (config.enableHTTPS) {
    asqApp.use(middleware.forceSSL);
  }

  //make sure upload directory exists
  var uploadDir = config.uploadDir
  if( ! fs.existsSync(uploadDir)){
    logger.debug("Creating uploadDir at ", uploadDir)
    mkdirp.sync(uploadDir);
  }
 
  asqApp.use(bodyParser.json());
  asqApp.use(bodyParser.urlencoded({ extended: true }));
  asqApp.use(multer({ dest: config.uploadDir}));

  //static files
  asqApp.use(serveStatic(path.join(rootDir, '/public/'), {'index': 'false'}));
  asqApp.use(serveStatic(path.join(rootDir, '/public/bower_components/'), {'index': 'false'}));
  asqApp.use(serveStatic(path.join(rootDir, '/client/presenterControl/public/'), {'index': 'false'}));
  asqApp.use(favicon(path.join(rootDir, '/public/favicon.ico')));

  asqApp.use(morgan('dev'));
  // asqApp.use(express.methodOverride()); //Enable DELETE & PUT
  asqApp.use(cookieParser());
  //redis store for session cookies
  var redisSessionStore = new redisStore({
    host: '127.0.0.1',
    port: 6379,
    db: 0,
  });

  asqApp.use(session({
    resave: true,
    saveUninitialized: false,
    store  : redisSessionStore,
    key : 'asq.sid',
    secret : 'ASQSecret'
    // cookie : {
    //   maxAge : 2592000000 // 30 days
    // }
  }));


  asqApp.set('sessionStore', redisSessionStore);
  //necessary initialization for passport plugin
  asqApp.use(passport.initialize());
  asqApp.use(flash());
  asqApp.use(passport.session());

  asqApp.use(errorMiddleware.logErrors);
  asqApp.param('user', middleware.isExistingUser);
  asqApp.param('liveId', middleware.setLiveSession);


  asqApp.get('/checkusername/:username/', registration.checkusername);

  //Routes initialization
  routes.setUp(asqApp, middleware);

  // didn't match anything display 404
  asqApp.use(function(req, res, next){
    res.status(404);
    res.render('404', {'msg': 'Sorry cant find that!'});
  });

  asqApp.get('/404', function(req, res, next){
    res.render('404');
  });

  if ('development' == asqApp.get('env')) {
    asqApp.use(errorMiddleware.errorHandler({showStack: true }));

    if (config.enableHTTPS) {
      //Passphrase should be entered at launch for production env.
      credentials.passphrase = fs.readFileSync('./ssl/pass-phrase.txt')
          .toString().trim();

    }
    validation.getErrorPassword = function devGetErrorPassword(candidate) {
      if (require('validator').isNull(candidate)) {
        return 'blank';
      }
      logger.debug('[devel mode] No password constraint');
      return null;
    }
  };

  if ('production' == asqApp.get('env')) {
    asqApp.enable('view cache');
    asqApp.use(errorMiddleware.errorHandler());
  };
}

module.exports = setupMiddleware;
