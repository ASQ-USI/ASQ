
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , add = require('./routes/abook')
  , hello = require('./routes/helloWorld')  
  , http = require('http')
  , path = require('path')
  , photoalbum = require('./routes/photoalbum');

var app = express();

// mongoose, db, and schemas are global
mongoose = require('mongoose');
db = mongoose.createConnection('localhost', 'test');
schemas = require('./models/models.js').AbookSchema


app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser({uploadDir: './public/images/'}));
  app.use(express.methodOverride());
  app.use(express.cookieParser('your secret here'));
  app.use(express.session());
  app.use(app.router);
  app.use(require('stylus').middleware(__dirname + '/public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/hello', hello.world);
app.get('/images/:path', photoalbum.get);



http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
