var sugar = require('sugar')
, chai = require('chai')
, chaiAsPromised = require("chai-as-promised")
, assert = chai.assert
, expect = chai.expect
, request = require('supertest')
, express = require('express')
, upload = require('../routes/upload')
, mongoose = require('mongoose')
, schemas = ('../model/models')
, passport = require('passport')
, passportMock = require('./util/mock-passport-middleware')
, proxyquire =  require('proxyquire')
, configStub = {};

// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);

// mongodb connection
db = mongoose.createConnection('127.0.0.1', 'asq');

// mock user
var User = db.model('User', schemas.userSchema);
var mockUser = new User({
  _id: mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
  name: "Alexandros Kontopides",
  password : "Tony",
  email : 'user@domain.com'
});

var app = express();
app.configure(function() {
  app.use(express.bodyParser({uploadDir: './slides/'}));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'Ti kapsoura einai auth re miky'
  }));
  app.use(passportMock.initialize(mockUser));
  return app.use(passport.session());
});

//mock config object
var upload = proxyquire('../routes/upload', { '../config': {rootPath: __dirname + '/..'} });

//upload root
app.post('/user/username/upload/', upload.post);


describe('upload', function() {

   //callback tests
   describe('.post(req, res)', function(){

    after(function(){
      db.close();
    });

    it("should return a json object ", function(done){
      request(app)
      .post('/user/username/upload/')
      .set('Accept', 'application/json')
      .attach('upload', 'test/fixtures/sample_presentation_no_questions.zip', 'upload')      
      .expect('Content-Type', /json/)
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });

    it.skip("should not recreate a question that already exists");

  });

});
