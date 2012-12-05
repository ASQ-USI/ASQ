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
  , registration = require('./routes/registration');
  


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

app = express();
app.engine('ejs', engine);


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
    app.use(express.session());
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
  res.render('logged');
});

/**
   @description Prevent to serve included js files with presentations.

   This will serve a custom verion of impress.js and the appropriate websocket
   module.
 */
app.get('/:whatever/js/*', function(req, res) {
    res.sendfile('./js/' + req.params[0]);
});

app.get('/live/:user/js/*', function(req, res) {
    res.sendfile('./js/' + req.params[0]);
});

app.get('/live/:user/', routes.live);
app.get('/live/:user/*', function(req, res) {
    res.sendfile('./slides/demo/' + req.params[0]);
});

app.get('/admin/',  ensureAuthenticated, routes.admin);
app.get('/admin/*', function(req, res) {
    res.sendfile('./slides/demo/' + req.params[0]);
});

app.post('/upload', ensureAuthenticated, routes.upload);
app.get('/upload', ensureAuthenticated, routes.showUpload);

//Someone types /signup URL, which has no meaning. He is redirected.
app.get('/signup', function(req, res){
  res.redirect('/');
});

//Registration happened. 
app.post('/signup', registration.signup);

//Someone types /user URL, if he's authenticated he sees his profile page, otherwise gets redirected
app.get('/user', ensureAuthenticated, function(req,res) {
    res.render('user', { user: req.user, message: req.flash('error') });
});

//Someone tries to Log In, if plugin authenticates the user he sees his profile page, otherwise gets redirected
app.post('/user', passport.authenticate('local', { failureRedirect: '/', failureFlash: true}) ,function(req, res) {
    res.redirect('/user');
});

//The user logs out, and get redirected
app.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});

//Serving static files
app.get('/images/:path', registration.get);

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.render('index', { error: req.flash('error') });
}


/** HTTP Server */
var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

/**
   @description  Require socket.io (websocket wrapper) and listen to the server.
   This needs to be requierd at this point since we need the server to already
   be running.
 */
var io = require('socket.io').listen(server);
var currentSlide = 0;
/**
   @description  Configure socket server
   @todo Handle disconnect, authentification and multiple sessions
 */
io.sockets.on('connection', function(socket){

    /** @function Handle connection from viewer. */
    socket.on('viewer', function(event) {
        socket.join('viewers');
        socket.emit('goto', {slide:currentSlide});
        io.sockets.in('admins').emit('new', {});
    });
    /** @function Handle connection from admin. */
    socket.on('admin', function(event) {
        socket.join('admins');
    });

    /**
       @ function Handle goto event.
       When a goto event from an admin is sent, update status of current slide
       and informs all viewers of the new current slide
       @todo Implement authentification to make sure the event comes from a
       valid admin.
     */
    socket.on('goto', function(event) {
        currentSlide = event.slide;
        io.sockets.in('viewers').emit('goto', event);
    });

    socket.on('impress:start', function(event) {
        io.sockets.in('viewers').emit('impress:start', event);
    })
});