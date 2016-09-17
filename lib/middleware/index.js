/** 
  * @module lib/middleware/index
  * @description attaches middleware to the server
*/
const logger = require('logger-asq');
const config = require('../../config');
const cons = require('consolidate');
const dust = require('dustjs-helpers');
const express = require('express');
const helmet = require('helmet');
const serveStatic = require('serve-static');
const session = require('express-session');
const favicon = require('serve-favicon');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const multer = require('multer');
const flash = require('connect-flash');
const fs = require('fs');
const mkdirp = require('mkdirp');
const path = require('path');
const credentials = config.enableHTTPS ? {
    key                : fs.readFileSync(config.keyPath),
    cert               : fs.readFileSync(config.certPath),
    ca                 : fs.readFileSync(config.caPath),
    requestCert        : config.requestCert,
    rejectUnauthorized : config.rejectUnauthorized,
  } : {};
const lib             = require('../');

const passport        = require('passport');
const errorMiddleware = require('./errorMiddleware');
const middleware      = require('./middleware');
const redisSessionStore = require('./redisSessionStore');
const registration    = require('../../routes/registration');
const routes          = require('../../routes');
const validation      = require('../../shared/validation');

const Setting = db.model('Setting');

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
  const rootDir =  config.rootDir;

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
  const uploadDir = config.uploadDir
  if( ! fs.existsSync(uploadDir)){
    logger.debug("Creating uploadDir at ", uploadDir)
    mkdirp.sync(uploadDir);
  }
  
  asqApp.use(helmet.hidePoweredBy())
  asqApp.use(bodyParser.json());
  asqApp.use(bodyParser.urlencoded({ extended: true }));
  asqApp.use(multer({ dest: config.uploadDir}));

  //static files
  asqApp.use(serveStatic(path.join(rootDir, '/public/'), {'index': 'false'}));
  asqApp.use(serveStatic(path.join(rootDir, '/public/bower_components/'), {'index': 'false'}));
  asqApp.use(serveStatic(path.join(rootDir, '/public/ui/'), {'index': 'false'}));
  asqApp.use(serveStatic(path.join(rootDir, '/public/cockpit/'), {'index': 'false'}));
  asqApp.use(favicon(path.join(rootDir, '/public/favicon.ico')));

  asqApp.use(morgan('dev'));
  // asqApp.use(express.methodOverride()); //Enable DELETE & PUT

  const expressSession = session({
    resave: true,
    saveUninitialized: false,
    store  : redisSessionStore,
    key : 'asq.sid',
    secret : 'ASQSecret'
  });
  asqApp.use(expressSession);

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
    // asqApp.enable('view cache');
    asqApp.use(errorMiddleware.errorHandler());
  };
}

module.exports = setupMiddleware;
