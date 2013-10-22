/**
  @fileoverview tests for lib/upload.js for ASQ
**/

var config    = require('../config')
  , mongoose  = require('mongoose');

// mongodb connection (Global)  
db = mongoose.createConnection(config.host, config.dbName)

var chai            = require('chai')
  , chaiAsPromised  = require("chai-as-promised")
  , expect          = chai.expect
  , request         = require('supertest')
  , express         = require('express')
  , uploadHandler   = require('../routes/user/presentations/handlers').uploadPresentation
  , schemas         = require('../models')
  , passport        = require('passport')
  , passportMock    = require('./util/mock-passport-middleware')
  , configStub      = {}
  , path            = require('path')
  , lib             = require('../lib')
  , fsUtils         = lib.utils.fs
  , _               = require('underscore');

// support for promises
require("mocha-as-promised")();
chai.use(chaiAsPromised);


// mock user
var User = mongoose.model('User');
var mockUser = new User({
  _id: mongoose.Types.ObjectId('4edd40c86762e0fb12000003'),
  name: "AlexandrosKontopides",
  password : "Tony",
  email : 'user@domain.com'
});

// setup a small app for the upload test
app = express();
app.configure(function() {
  app.set('uploadDir', path.resolve(__dirname, config.uploadDir));
  app.use(express.bodyParser({uploadDir: './test/slides/'}));
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'Ti kapsoura einai auth re miky'
  }));
  app.use(passportMock.initialize(mockUser));
  return app.use(passport.session());
});

//upload root
app.post('/upload/', uploadHandler);


describe('upload', function() {

   //callback tests
   describe('.post(req, res)', function(){

    // after(function(done){
    //   // cleanup db and files
    //   var Slideshow = db.model('Slideshow');

    //   Slideshow.find({}).exec()
    //     .then(
    //       function(docs){
    //         var uploadPath = app.set('uploadDir');
    //         var totalDocs = docs.length;
    //         if(totalDocs == 0){
    //           //return done(new Error("totalDocs shouldn't be 0"));
    //           return done();
    //         }

    //         _.each(docs, function(doc){
    //           //remove slideshow folder
    //           fsUtils.removeRecursive(uploadPath + '/' +doc.id, function(err, success){
    //             if(err){
    //               return done(err)
    //             }
    //             //remove thumbs
    //             fsUtils.removeRecursive(uploadPath + '/thumbs/' +doc.id, function(err, success){
    //               if(err){
    //                 return done(err)
    //               }

    //               if(--totalDocs ==0){
    //                 //cleanup slideshow db
    //                 Slideshow.remove({}).exec()
    //                   .then(
    //                     function(){
    //                       //cleanup question db
    //                       var Question = db.model('Question')
    //                         return Question.remove({}).exec()                      
    //                   })
    //                   .then(
    //                     function(){
    //                      db.close()
    //                      done();
    //                   },
    //                     function(err){
    //                       if(err){
    //                         return done(err)
    //                       }
    //                   });
    //                 } 
    //               });         
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
      .post('/upload/')
      .set('Accept', 'application/json')
      .attach('upload', 'assets/tade.zip', 'upload')      
      .expect(302)
      .end(function(err, res){
        if (err) return done(err);
        done()
      });
    });

    it.skip("should not recreate a question that already exists");

  });

});
