var express = require('express')
  , http = require('http')
  , path = require('path')
  , routes = require('./routes')
  , io = require('socket.io');

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
app.get('/live/', app.configure(function() {app.use(express.static(path.join(__dirname, '/slides/example/')))}));
app.get('/admin', routes.admin);
app.get('/js/:id', function(req, res) {
    res.sendfile('./js/' + req.params.id);
});

//app.get('/css/:id', function(req, res) {
//    console.log('GET /css/' + req.params.id);
//    res.sendfile('./public/presentations/example/css/' + req.params.id);
//});

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});