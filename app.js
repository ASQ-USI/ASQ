var express = require('express'),
	cheerio = require('cheerio'),
	fs = require('fs');

var app = express();

app.configure(function(){
    app.use(express.static(__dirname + '/public'));
});

// app.get('/:file', function(req, res) {
//   res.sendfile(__dirname + '/public' + file);
// });

app.get('/', function(req, res) {
  // var html = fs.readFileSync(__dirname + '/public/team.html', 'utf8'); 
  // var $ = cheerio.load(html);
  // var scriptNode = '<script>alert("script appended!");</script>';
  // $('body').append(scriptNode);
  // res.send($.html());
  res.sendfile(__dirname + '/public/team.html');
});

app.get('/edit', function(req, res) {
  var html = fs.readFileSync(__dirname + '/public/team.html', 'utf8'); 
  var $ = cheerio.load(html);
  var scriptNode = '<script src="js/builder.js"></script>';
  scriptNode += '<script src="js/main.js"></script>';
  $('body').append(scriptNode);
  res.send($.html());
});

app.listen(3000);
console.log('Listening on port 3000');