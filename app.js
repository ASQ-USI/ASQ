/**
    @fileoverview app main file, for initialization of the server
*/

var express     = require('express')
  , http          = require('http')
  , path        = require('path')
  , fs          = require('fs')
  , config      = require('./config')
  , redisStore  = require('connect-redis')(express)
  , http        = require('http')
  , credentials = config.enableHTTPS ? { 
      key         : fs.readFileSync(config.keyPath),
      cert        : fs.readFileSync(config.certPath),
      ca          : fs.readFileSync(config.caPath),
      requestCert : config.requestCert,
      rejectUnauthorized : config.rejectUnauthorized,
    } : {}
  , appLogger     = require('./lib/logger').appLogger
  , cons            = require('consolidate')
  , dust            = require('dustjs-linkedin')
  , slashes         = require("connect-slashes")
  , routes          = require('./routes')
  , flash           = require('connect-flash')
  , lib             = require('./lib')
  , registration    = require('./routes/registration')
  , editFunctions   = require('./routes/edit')
  , statistics      = require('./routes/statistics')
  , appLogger       = lib.logger.appLogger
  , authentication  = lib.authentication
  , passport        = lib.passport.init()
  , formUtils       = lib.utils.form
  , errorMessages   = lib.errorMessages
  , middleware      = require('./routes/middlewares');

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into a`nd deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

// passport.serializeUser(function(user, done) {
//   done(null, user._id);
// });

// passport.deserializeUser(function(id, done) {
//     var User = db.model('User', schemas.userSchema);
//     var out = User.findById(id, function (err, user) {
//         if (user) {
//             done(err, user);
//         } else {
//             done(null,new Error('User ' + id + ' does not exist'));
//         }
//       })
//     });

// // Use the LocalStrategy within Passport.
// //   Strategies in passport require a `verify` function, which accepts
// //   credentials (in this case, a username and password), and invoke a callback
// //   with a user object.  In the real world, this would query a database;
// //   however, in this example we are using a baked-in set of users.

// passport.use(new LocalStrategy(
//   function(username, password, done) {
//     // asynchronous verification, for effect...
//     process.nextTick(function () {
//     var User = db.model('User', schemas.userSchema);
//     var out = User.findOne({ name: username }, function (err, user) {
//         if (err) { return done(err); }
//         if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
//         user.isValidPassword(password, function(err, isMatch) {
//             if (err) { return done(err); }
//             if (!isMatch) { return done(null, false, { message: 'Invalid password' }); }
//             return done(null, user);  
//         });
//       })
//     });
//   }
// ));

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
app.engine('dust', cons.dust);
// Global variable: hostname which we want to advertise for connection.
appHost = process.env.HOST;
clientsLimit = config.clientsLimit || 50;
appLogger.log('Clients limit: ' + clientsLimit);

// mongoose, db, and schemas are global
mongoose = require('mongoose');
db = mongoose.createConnection(config.mongoDBServer, config.dbName, config.mongoDBPort);
schemas = require('./models');

//Reidrection to secure url when HTTPS is used.


/** Configure express */
app.configure(function() {
  app.set('port', process.env.PORT);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'dust');
  if (config.enableHTTPS) {
    app.use(middleware.forceSSL);
  }
  app.set('uploadDir', path.resolve(__dirname, config.uploadDir));
  app.use(express.bodyParser({uploadDir: app.get('uploadDir')}));
  app.use(express.static(path.join(__dirname, '/public/')));
  app.use(express.favicon(path.join(__dirname, '/public/favicon.ico')));
  app.use(express.logger('dev'));
  app.use(express.methodOverride()); //Enable DELETE & PUT
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
    cookie : {
      maxAge : 2592000000 // 30 days
    } 
  }));
  app.set('sessionStore', redisSessionStore);
  //necessary initialization for passport plugin
  app.use(passport.initialize());
  app.use(flash());
  app.use(passport.session());
  app.use(app.router);
  app.use(function(err, req, res, next){
    appLogger.error(err.stack);
    res.send(500, 'Something broke!');
  });
  app.param('liveId', middleware.setLiveSession);
  app.use(slashes()); //Append slashes at the end of urls. (MUST BE at the end!)
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    if (config.enableHTTPS) {
        //Passphrase should be entered at launch for production env.
        credentials.passphrase = fs.readFileSync('./ssl/pass-phrase.txt')
            .toString().trim();
        
    }
    formUtils.prodValidUserForm = formUtils.isValidUserForm;
    formUtils.isValidUserForm = function(username, email, password, passwordConfirm, strict) {
      var errors = formUtils.prodValidUserForm(username, email, password, passwordConfirm, strict);
      if (errors === null || !errors.hasOwnProperty('password')) {
        return errors;
      } else if (Object.keys(errors).length === 1 
                  && errors.password === errorMessages.password.regex) {
        appLogger.debug('[devel mode] No password constraint');
        return null;
      } else if (errors.password === errorMessages.password.regex) {
        appLogger.debug('[devel mode] No password constraint');
        delete errors.password;
      }
      return errors;
    }
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// app.get('/', function(req, res){
  // res.render('index2', {
    // title: 'Testing out dust.js server-side rendering',
    // username: "Welcome Max"
  // });
// });

/** Routing */
//MOVED
 // app.get('/', ensureAuthenticated, function(req, res){
 //   res.redirect('/user');
 // });

//MOVED
/** Initialize a new session with slides matching the id */
//app.get('/user/start/:id', ensureAuthenticated, routes.slides.start);

/** Stop a user current session **/
app.get('/user/stop', ensureAuthenticated, routes.slides.stop);

/** Edit user account settings **/
//MOVED
// app.get('/user/settings', ensureAuthenticated, registration.settings);
// app.post('/user/settings', ensureAuthenticated, registration.saveSettings);

/** Join the session of user */
app.get('/live/:user/', authentication.authorizeSession, routes.slides.live);
app.get('/live/:user/*', routes.slides.liveStatic);

/** Control your current session (if any) */
app.get('/admincontroll',  ensureAuthenticated, routes.slides.adminControll);
app.get('/admincontroll/*', ensureAuthenticated, routes.slides.adminStatic);
app.get('/admin/',  ensureAuthenticated, routes.slides.admin);
app.get('/admin/*', ensureAuthenticated, routes.slides.adminStatic);

/** Upload new slides */
//MOVED
//app.post('/user/upload/', ensureAuthenticated, routes.upload.post);
//app.get('/user/upload/', ensureAuthenticated, routes.upload.show);

//Someone types /signup URL, which has no meaning. He is redirected.
//MOVED
// app.get('/signup/', function(req, res){
//   res.redirect('/');
// });

app.get('/checkusername/:username/', registration.checkusername);

//Registration happened.
//MOVED
//app.post('/signup', registration.signup);

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
//MOVED
// app.get('/user/', ensureAuthenticated, function(req,res) {
//     res.redirect('/user/'+req.user.name + '/');
// });

//Someone tries to Log In, if plugin authenticates the user he sees his profile page, otherwise gets redirected
//MOVED
// app.post('/user', passport.authenticate('local', {
//   failureRedirect : '/',
//   failureFlash    : true
// }),function(req, res) {
//     var redirect_to = req.session.redirect_to ? 
//       req.session.redirect_to : "/user/" + req.body.username + "/" ;
//     res.redirect(redirect_to);
// });

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
//MOVED
//app.get('/user/:username/', ensureAuthenticated, registration.renderuser);

//Serves thumbnails 
//MOVED
//app.get('/slides/thumbs/:id/:file', ensureAuthenticated, routes.slides.serveThumbs)

//REDIRECT LOOP FOR SOME REASON
// app.get('/user/edit/', ensureAuthenticated, function (req,res) {
//     res.redirect("/user/edit")
// });

// app.get('/user/edithtml/', ensureAuthenticated, function (req,res) {
//     res.redirect("/user/edit")
// });

// app.get('/user/editstyle/', ensureAuthenticated, function (req,res) {
//     res.redirect("/user/edit")
// });
// app.get('/user/editquestions/', ensureAuthenticated, function (req,res) {
//     res.redirect("/user/edit")
// });

//MOVED
//app.get('/user/edit/:id', ensureAuthenticated, editFunctions.editslideshow);

app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);

//app.post('/user/edit/:id', ensureAuthenticated, editFunctions.addquestion);

//app.post('/user/editquestions/:id', ensureAuthenticated, editFunctions.addquestion);

//app.get('/user/delete/:id', ensureAuthenticated, editFunctions.deletequestion);

//MOVED
//pp.del('/slideshows/:id', ensureAuthenticated, editFunctions.deleteSlideshow);

//app.get('/stats/:id/', ensureAuthenticated, registration.sendstats);

//The user logs out, and get redirected
//MOVED
// app.get('/logout/', function(req, res){
//   req.logout();
//   res.redirect('/');
// });


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
	res.render('slidesIFrame', {id: req.params.id, url: req.query.url});
});
//MOVED
// app.get('/slidesRender/:id', routes.slides.render);
// app.get('/slidesRender/:id/*',  routes.slides.renderStatic);

//Show splash screen for starting presentations
//app.get('/slidesSplashScreen', routes.slides.splashScreen)

//Test call to create sample stats data
app.get('/stats/createSampleData', statistics.createSampleData)

//Request statistical data for Google Chart
app.get('/stats/getStats', statistics.getStats)


//Render test page
app.get('/test/perQuestion',function(req, res){ res.render('test', {questionId: req.query.questionId})});

// Crash at start with node.js 0.10.10
//app.get('/render/', ensureAuthenticated, registration.parsequestion);
//app.get('/render2/',  registration.sendanswer);

routes.setUp(app, middleware);

/** HTTP(S) Server */
if (config.enableHTTPS) {
    var server = require('https').createServer(credentials, app).listen(app.get('port'), function(){
        appLogger.log("ASQ HTTPS server listening on port " + app.get('port') + " in " + app.get('env') + " mode");
    });
    
    var serverHTTP = http.createServer(app).listen(config.HTTPPort, function() {
        appLogger.log("HTTP redirection ready, listening on port " + config.HTTPPort);
    });

} else {
    var server = http.createServer(app).listen(app.get('port'), function(){
      //var appLogger = winston.loggers.get('application');
      appLogger.info("ASQ HTTP server listening on port " + app.get('port') + " in " + app.get('env') + " mode");
    });
}

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('./lib/sockets').listen(server);
