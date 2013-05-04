var chai          = require('chai')
, chaiAsPromised  = require("chai-as-promised")
, expect          = chai.expect
, request         = require('supertest')
, express         = require('express')
, upload          = require('../routes/upload')
, schemas         = require('../models/models')
, mongoose        = require('mongoose')
, passport        = require('passport')
, passportMock    = require('./util/mock-passport-middleware')
, proxyquire      =  require('proxyquire')
, configStub      = {}
, path            = require('path')
, fsUtil          = require('../lib/fs-util')
, _               = require('underscore')

// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);

// mongodb connection
db = mongoose.createConnection('127.0.0.1', 'test-asq');

// mock user
var User = mongoose.model('User');
var mockUser = new User({
  _id: mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
  name: "Alexandros Kontopides",
  password : "Tony",
  email : 'user@domain.com'
});

// setup a small app for the upload test
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
var upload = proxyquire('../routes/upload', { '../config': { rootPath: path.join( __dirname + '/..') } });

//upload root
app.post('/user/username/upload/', upload.post);


describe('upload', function() {

   //callback tests
   describe('.post(req, res)', function(){

    after(function(done){
      var Slideshow = db.model('Slideshow');

      Slideshow.find({}, function(err, docs ){
        var uploadPath = path.join( __dirname + '/../slides/');
          var totalDirs = docs.length;
          if(totalDirs==0){
            done(new Error("totalDirs shouldn't be 0"))
          }

          _.each(docs, function(doc){
          fsUtil.removeRecursive(uploadPath, function(err,done){
            if(err){
              done(err)
            }
            if(--totalDirs ==0){
              Slideshow.remove({}, function(err){
                if(err){
                  done(err)
                }
                var Question = db.model('Question')
                Question.remove({}, function(err){
                  if(err){
                    done(err)
                  }
                   db.close()
                   done();
                });
              });           
            }
          });
        });
      });
    });

    it("should return a json object ", function(done){
      request(app)
      .post('/user/username/upload/')
      .set('Accept', 'application/json')
      .attach('upload', 'test/fixtures/sample_presentation_valid_questions.zip', 'upload')      
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
