/** @module routes/upload
    @author Jacques Dafflon jacques.dafflon@gmail.com
    @description Functions handling upload of new slideshows.
    TODO Handle upload of incrrect slideshows and their removal from the server.
    */

var schemas = require('../models/models')
, fs        = require('fs')
, unzip     = require('unzip')
, pfs       = require('promised-io/fs')
, promise   = require('promised-io/promise')
, when      = promise.when
, seq       = promise.seq
, all       = promise.all
, config    = require('../config')
, AdmZip    = require('adm-zip')
, rimraf    = require('rimraf')
, logger    = require('../lib/logger')
, asqParser = require('../lib/asqParser')
, cheerio   = require('cheerio')

logger.setLogLevel(4);

module.exports.show = function(req, res) {
  res.render('upload', {username: req.user.name});
}

/*
 * Handle a POST request to the server to upload a new slideshow.
 * This function checks the slideshow is in the correct format in order to work
 * Some checks and handling still need to be done...
 * Handling for stats is long and complex and need to be optimized.
 */
module.exports.post = function(req, res) {


/**
  STEPS TO CREATE A NEW SLIDESHOW
  1) unzip files
  2) make sure index html exists
  3) parse questions
  4) create new questions if they exist
  5) update the slide information for each question
  6) store new slideshow object


readfile()
  .then(extractquestions)
  .then(check for new questions)
  .then(insert new questions)
  .then(update slide show information for new questions)

  */


  var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

  var newSlideshow = new Slideshow({
    title:req.files.upload.name,
    owner: req.user._id
  });


  var folderPath = config.rootPath + '/slides/' + newSlideshow._id;
  var zip = new AdmZip(req.files.upload.path);
  zip.extractAllTo(folderPath);

  var index = pfs.readFile(folderPath + '/index.html').then(    
    function(file) {
      logger.log(folderPath + '/index.html')
      logger.log('index.html ok');
      logger.log('parsing file for questions...');

      asqParser.parse(cheerio.load(file))
        .then(function(questions){
          logger.log(JSON.stringify(questions))
          logger.log('questions successfully parsed');
          res.send(200, JSON.stringify(questions));
        },
        function(error){
          logger.error(error);
        })

      
      
      return true;
    },
    function() {
      logger.error('index.html is missing');
      reject(new Error('index.html is missing'));
      return false;
    }
  );

    // Check and parse assets.json
    // var assets = pfs.readFile(folderPath + '/assets.json').then(
    //   function(file) {
    //     console.log('assets ok');
    //     var assets = JSON.parse(file);
    //     newSlideshow.title = assets.title;
    //     newSlideshow.course = "General course";
    //     newSlideshow.links = assets.links || [];
    //     console.log(assets);
    //     return true;
    //   },
    //   function(error) {
    //     console.log(__dirname)
    //     console.log(error)
    //     console.log('error: assets.json');
    //     return false;
    //   }
    //   );

    // Check and parse questions.json
    // var questions = pfs.readFile(folderPath + '/questions.json').then(
    //   function(file) {
    //     console.log('questions ok');
    //     var questions = JSON.parse(file);
    //     for (var i=0; i<questions.length;i++) {
    //      var questionDB= db.model('Question', schemas.questionSchema);
    //      var newQuestion=new questionDB({
    //       questionText:questions[i].questionText,
    //       questionType: questions[i].questionType,
    //       afterslide: questions[i].afterslide
    //     });
    //      newQuestion.save();
    //      newSlideshow.questions.push(newQuestion._id);

    //      var optionDB=db.model('Option', schemas.optionSchema);
    //      for (var j=0;j< questions[i].options.length;j++) {
    //       newOptionDB=new optionDB( {
    //         optionText: questions[i].options[j].optionText,
    //         correct: questions[i].options[j].correct
    //       });
    //       newOptionDB.save();
    //       newQuestion.answeroptions.push(newOptionDB._id);
    //       newQuestion.save();

    //     }


    //   }

    //   return true;
    // },
    // function() {
    //   console.log('error: questions.json');
    //   newSlideshow.questions = [];
    //   return false;
    // }
    // );

// var group = all(index, assets, questions);
// var done = when(group,
//   function(result) {
//     console.log('index result is ' + result[0]);
//     console.log('assets result is ' + result[1]);
//     console.log('questions result is ' + result[2]);
//     console.log('all ok');
//     seq([
//       function() {
//         newSlideshow.save();
//       },
//       function() {
//         if (result[1]) pfs.unlink(folderPath + '/assets.json');
//       },
//       function() {
//         if (result[2]) pfs.unlink(folderPath + '/questions.json');
//       },
//       function() {
//         var User = db.model('User', schemas.userSchema);
//         User.findByIdAndUpdate(req.user._id, { $push: {slides : newSlideshow._id } }, function(err, user) {
//           pfs.unlink(req.files.upload.path)
//           //.then(res.redirect('/user/'));
//         });
//       }]);
//   },
//   function() {
//     console.log('something went wrong');

//             //Remove the extracted folder
//             rimraf(folderPath, function(err) {
//               if(err) throw err;
//                 // Remove the downloaded archive (zip file).
//                 pfs.unlink(req.files.upload.path)
//                 //.then(res.redirect('/'));
//               });
//           });
}
