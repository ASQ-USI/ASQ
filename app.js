/**
    @fileoverview app main file, for initialisation of the server
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

var express = require('express')
  , http = require('http')
  , path = require('path')
  , engine = require('ejs-locals')
  , slashes = require("connect-slashes")
  , routes = require('./routes')
  , flash = require('connect-flash')
  , passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy
  , registration = require('./routes/registration')
  , statistics = require('./routes/statistics')
  , SessionMongoose = require("session-mongoose")(express)
  , mongooseSessionStore = new SessionMongoose({
        url: "mongodb://localhost/login",
        interval: 120000 
    });

  var config = require('./config');
  
  // save sessionStore to config for later access
  config.setSessionStore(mongooseSessionStore);



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
//   Strategies in passport require a `verify` function, which accept
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
        if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
        return done(null, user);
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
        res.render('index', { message: req.flash('error'), fromsignup:'false' });
    } else {
        res.redirect("/");
    }
    return false; //Ensure a value is always returned
}

app = express();
app.engine('ejs', engine);
// Global variable: hostname which we want to advertise for connection.
appHost = process.argv[2] || 'localhost';
console.log(appHost);

// mongoose, db, and schemas are global
mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'asq');
schemas = require('./models/models.js');

/** Configure express */
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser({uploadDir: './slides/'}));
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    //mongosession store to be used with socket.io
    app.use(express.session({secret : 'ASQsecret' , store : mongooseSessionStore }));
    //necessary initialization for passport plugin
    app.use(passport.initialize());
    app.use(flash());
    app.use(passport.session());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public/'));
    app.use(express.static(path.join(__dirname, '/public/')));
    //used to append slashes at the end of a url (MUST BE after static)
    app.use(slashes());
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


/** Routing */
app.get('/', ensureAuthenticated, function(req, res){
  res.redirect('/user');
});

/** Initialize a new session with slides matching the id */
app.get('/user/:username/start/:id', ensureAuthenticated, routes.slides.start);

/** Stop a user current session **/
app.get('/user/:username/stop', ensureAuthenticated, routes.slides.stop);

/** Join the session of user */
app.get('/live/:user/', routes.slides.live);
app.get('/live/:user/*', routes.slides.liveStatic);

/** Control your current session (if any) */
app.get('/admin/',  ensureAuthenticated, routes.slides.admin);
app.get('/admin/*', ensureAuthenticated, routes.slides.adminStatic);

/** Upload new slides */
app.post('/user/:username/upload', ensureAuthenticated, routes.upload.post);
app.get('/user/:username/upload', ensureAuthenticated, routes.upload.show);

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
app.post('/user', passport.authenticate('local', { failureRedirect: '/', failureFlash: true}) ,function(req, res) {
    res.redirect('/user/'+req.body.username+"/");
});

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
app.get('/user/:username/', ensureAuthenticated, registration.renderuser);


app.get('/user/:username/edit/', ensureAuthenticated, function (req,res) {
    res.redirect("/user/"+req.params.username+"/edit")
});

app.get('/user/:username/edit', ensureAuthenticated,registration.editslideshow);

app.post('/user/:username/edit', ensureAuthenticated, registration.addquestion);

app.get('/user/:username/delete', ensureAuthenticated, registration.deletequestion);

app.get('/user/:username/deleteslideshow', ensureAuthenticated, registration.deleteslideshow);

app.get('/stats/:id/', ensureAuthenticated, registration.sendstats);

//The user logs out, and get redirected
app.get('/logout/', function(req, res){
  req.logout();
  res.redirect('/');
});

//Serving static files
app.get('/images/:path/', registration.get);

app.get('/user/:username/statistics', ensureAuthenticated,  statistics.getSessionStats);

app.get('/user/:username/edithtml', ensureAuthenticated, registration.edithtml);
app.post('/user/:username/edithtml', ensureAuthenticated, registration.savehtml);

app.get('/render/', ensureAuthenticated, registration.parsequestion);
app.get('/render2/',  registration.sendanswer);


/** HTTP Server */
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('./lib/sockets').listen(server);
