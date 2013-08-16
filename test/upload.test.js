var chai          = require('chai')
, chaiAsPromised  = require("chai-as-promised")
, expect          = chai.expect
, request         = require('supertest')
, express         = require('express')
, upload          = require('../routes/upload')
, schemas         = require('../models')
, mongoose        = require('mongoose')
, passport        = require('passport')
, passportMock    = require('./util/mock-passport-middleware')
, proxyquire      =  require('proxyquire')
, configStub      = {}
, path            = require('path')
, lib             = require('../lib')
, _               = require('underscore')
, config          = require('../config');

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
app = express();
app.configure(function() {
  app.set('uploadDir', path.resolve(__dirname, config.uploadDir));
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

    // after(function(done){
    //   // cleanup db and files
    //   var Slideshow = db.model('Slideshow');

    //   Slideshow.find({}).exec()
    //     .then(
    //       function(docs){
    //         var uploadPath = path.join( __dirname + '/../slides/');
    //         var totalDocs = docs.length;
    //         if(totalDocs == 0){
    //           return done(new Error("totalDocs shouldn't be 0"));
    //         }

    //         _.each(docs, function(doc){
    //           lib.fsUtils.removeRecursive(uploadPath + doc.id, function(err, success){
    //             if(err){
    //               return done(err)
    //             }
    //             if(--totalDocs ==0){
    //               Slideshow.remove({}).exec()
    //                 .then(
    //                   function(){
    //                     var Question = db.model('Question')
    //                       return Question.remove({}).exec()                      
    //                 })
    //                 .then(
    //                   function(){
    //                    db.close()
    //                    done();
    //                 },
    //                   function(err){
    //                     if(err){
    //                       return done(err)
    //                     }
    //                 });
    //               }          
    //             });              
    //         });
    //     });
    // });
    
    
    it.skip("should extract the questions and add them to the database");
    it.skip("should create a file");
    it.skip("with the correct markup for questions");
    it.skip("should save the slideshow");

    it("should redirect to the users page ", function(done){
      request(app)
      .post('/user/username/upload/')
      .set('Accept', 'application/json')
      //.attach('upload', 'test/fixtures/sample_presentation_valid_questions_stats.zip', 'upload') 
      .attach('upload', 'assets/SamplePresentation.zip', 'upload')      
      .expect(302)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });

    it.skip("should not recreate a question that already exists");

  });

});
