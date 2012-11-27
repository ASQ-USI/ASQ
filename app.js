/**
    @fileoverview app main file, for initialisation of the server
    @author Jacques Dafflon jacques.dafflon@gmail.com
*/

var express = require('express')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes');

var app = express();

/** Configure express */
app.configure(function() {
    app.set('port', process.env.PORT || 3000);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'ejs');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.cookieParser('your secret here'));
    app.use(express.session());
    app.use(app.router);
    app.use(require('stylus').middleware(__dirname + '/public'));
    app.use(express.static(path.join(__dirname, '/public/')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/** Routing */
app.get('/', routes.index);
app.get('/live', routes.live);
app.get('/live/', app.configure(function() {app.use(express.static(path.join(__dirname, '/slides/demo/')))}));
app.get('/admin', routes.admin);

/**
   @description Prevent to serve included js files with presentations.

   This will serve a custom verion of impress.js and the appropriate websocket
   module.
 */
app.get('/js/:id', function(req, res) {
    res.sendfile('./js/' + req.params.id);
});

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
});