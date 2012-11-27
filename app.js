var express = require('express')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes');

var app = express();


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
    //app.use(express.static(__dirname + '/public'))
    app.use(express.static(path.join(__dirname, '/public/')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/live', routes.live);
app.get('/live/', app.configure(function() {app.use(express.static(path.join(__dirname, '/slides/demo/')))}));
app.get('/admin', routes.admin);
app.get('/js/:id', function(req, res) {
    res.sendfile('./js/' + req.params.id);
});

var server = http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});

var io = require('socket.io').listen(server);

var currentSlide = 0;
io.sockets.on('connection', function(socket){
    socket.on('viewer', function(event) {
        socket.join('viewers');
        socket.emit('goto', {slide:currentSlide});
        io.sockets.in('admins').emit('new', {});
    });

    socket.on('admin', function(event) {
        socket.join('admins');
    });

    socket.on('goto', function(event) {
        currentSlide = event.slide;
        io.sockets.in('viewers').emit('goto', event);
    });
});