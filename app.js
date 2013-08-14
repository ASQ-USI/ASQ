/**
    @fileoverview app main file, for initialization of the server
*/

var express     = require('express')
  , path        = require('path')
  , fs          = require('fs')
  , config      = require('./config')
  , redisStore  = require('connect-redis')(express)
  , http        = require('http')
  , credentials = config.enableHTTPS ? { 
  , SessionMongoose       = require("session-mongoose")(express)
      cert        : fs.readFileSync(config.certPath),
      ca          : fs.readFileSync(config.caPath),
      requestCert : config.requestCert,
      rejectUnauthorized : config.rejectUnauthorized,
    } : {}
  , cons            = require('consolidate')
  , dust            = require('dustjs-linkedin')
  , slashes         = require("connect-slashes")
  , routes          = require('./routes')
  , flash           = require('connect-flash')
  , passport        = require('passport')
  , lib             = require('./lib')
  , LocalStrategy   = require('passport-local').Strategy
  , registration    = require('./routes/registration')
  , editFunctions   = require('./routes/edit')
  , statistics      = require('./routes/statistics')
  , appLogger       = lib.logger.appLogger
  , authentication  = lib.authentication;

// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.

passport.serializeUser(function(user, done) {
  done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    var User = db.model('User', schemas.userSchema);
    var out = User.findById(id, function (err, user) {
        if (user) {
            done(err, user);
        } else {
            done(null,new Error('User ' + id + ' does not exist'));
        }
      })
    });

// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accepts
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.

passport.use(new LocalStrategy(
  function(username, password, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
    var User = db.model('User', schemas.userSchema);
    var out = User.findOne({ name: username }, function (err, user) {
        if (err) { return done(err); }
        if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
        user.isValidPassword(password, function(err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false, { message: 'Invalid password' }); }
            return done(null, user);  
        });
      })
    });
  }
));

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
        app.use(function forceSSL(req, res, next) {
            if (!req.secure) {
                appLogger.log('HTTPS Redirection');
                return res.redirect('https://' + process.env.HOST + (app.get('port') === "443" ? "" : (":" + app.get('port'))) + req.url);
            }
            next();
        });
    }
    app.set('uploadDir', path.resolve(__dirname, config.uploadDir));
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({uploadDir: app.get('uploadDir')}));
    app.use(express.methodOverride());
    app.use(express.cookieParser());
    //mongosession store to be used with socket.io
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
    // app.use(require('stylus').middleware(__dirname + '/public/'));
    app.use(express.static(path.join(__dirname, '/public/')));
    //used to append slashes at the end of a url (MUST BE after static)
    app.use(slashes());
});

app.configure('development', function(){
    app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

    if (config.enableHTTPS) {
        //Passphrase should be entered at launch for production env.
        credentials.passphrase = fs.readFileSync('./ssl/pass-phrase.txt').toString().trim();
        
    }
    registration.isValidPassword = function(candidatePass) {
            appLogger.log('[devel mode] No password constraint');
            return true;
        };
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
 app.get('/', ensureAuthenticated, function(req, res){
   res.redirect('/user');
 });

/** Initialize a new session with slides matching the id */
app.get('/user/start/:id', ensureAuthenticated, routes.slides.start);

/** Stop a user current session **/
app.get('/user/stop', ensureAuthenticated, routes.slides.stop);

/** Edit user account settings **/
app.get('/user/settings', ensureAuthenticated, registration.settings);
app.post('/user/settings', ensureAuthenticated, registration.saveSettings);

/** Join the session of user */
app.get('/live/:user/', authentication.authorizeSession, routes.slides.live);
app.get('/live/:user/*', routes.slides.liveStatic);

/** Control your current session (if any) */
app.get('/admincontroll',  ensureAuthenticated, routes.slides.adminControll);
app.get('/admincontroll/*', ensureAuthenticated, routes.slides.adminStatic);
app.get('/admin/',  ensureAuthenticated, routes.slides.admin);
app.get('/admin/*', ensureAuthenticated, routes.slides.adminStatic);

/** Upload new slides */
app.post('/user/upload/', ensureAuthenticated, routes.upload.post);
app.get('/user/upload/', ensureAuthenticated, routes.upload.show);

//Someone types /signup URL, which has no meaning. He is redirected.
app.get('/signup/', function(req, res){
  res.redirect('/');
});

app.get('/checkusername/:username/', registration.checkusername);

//Registration happened.
app.post('/signup', registration.signup);

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
app.get('/user/', ensureAuthenticated, function(req,res) {
    res.redirect('/user/'+req.user.name + '/');
});

//Someone tries to Log In, if plugin authenticates the user he sees his profile page, otherwise gets redirected
app.post('/user', passport.authenticate('local', {
  failureRedirect : '/',
  failureFlash    : true
}),function(req, res) {
    var redirect_to = req.session.redirect_to ? 
      req.session.redirect_to : "/user/" + req.body.username + "/";
    res.redirect(redirect_to);
});

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
app.get('/user/:username/', ensureAuthenticated, registration.renderuser);

//Serves thumbnails 
app.get('/slides/thumbs/:id/:file', ensureAuthenticated, routes.slides.serveThumbs)

app.get('/user/edit/', ensureAuthenticated, function (req,res) {
    res.redirect("/user/edit")
});

app.get('/user/edithtml/', ensureAuthenticated, function (req,res) {
    res.redirect("/user/edit")
});

app.get('/user/editstyle/', ensureAuthenticated, function (req,res) {
    res.redirect("/user/edit")
});
app.get('/user/editquestions/', ensureAuthenticated, function (req,res) {
    res.redirect("/user/edit")
});


app.get('/user/edit/:id', ensureAuthenticated, editFunctions.editslideshow);

app.get('/user/editquestions/:id', ensureAuthenticated, editFunctions.editquestions);

//app.post('/user/edit/:id', ensureAuthenticated, editFunctions.addquestion);

//app.post('/user/editquestions/:id', ensureAuthenticated, editFunctions.addquestion);

//app.get('/user/delete/:id', ensureAuthenticated, editFunctions.deletequestion);

app.del('/slideshows/:id', ensureAuthenticated, editFunctions.deleteSlideshow);

//app.get('/stats/:id/', ensureAuthenticated, registration.sendstats);

//The user logs out, and get redirected
app.get('/logout/', function(req, res){
  req.logout();
  res.redirect('/');
});


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
app.get('/slidesRender/:id', routes.slides.render);
app.get('/slidesRender/:id/*', routes.slides.renderStatic);

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
        appLogger.info("ASQ HTTP server listening on port " + app.get('port') + " in " + app.get('env') + " mode");
    });
}

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('./lib/sockets').listen(server);
