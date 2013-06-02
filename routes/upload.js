/** @module routes/upload
    @description Functions handling upload of new slideshows.
    TODO Handle upload of incrrect slideshows and their removal from the server.
    */

var schema        = require('../models/models')
, slideshow       = require('../models/slideshow')
, questionModel   = require('../models/question')
, fs              = require('fs')
, unzip           = require('unzip')
, pfs             = require('promised-io/fs')
, cheerio         = require('cheerio')
, AdmZip          = require('adm-zip')
, rimraf          = require('rimraf')
, logger          = require('../lib/logger')
, asqParser       = require('../lib/asqParser')
, asqRenderer     = require('../lib/asqQuestionRenderer')
, config          = require('../config')
, fsUtil          = require('../lib/fs-util')
, when            = require('when')
, path            = require('path')
, _               = require('underscore')
, asyncblock      = require('asyncblock')
, exec            = require('child_process').exec;


logger.setLogLevel(4);

module.exports.show = function(req, res) {
  res.render('upload', {username: req.user.name});
}

/*
 * Handle a POST request to the server to upload a new slideshow.
 * This function does all the necessary steps to create a new slideshow
 * with questions
 */
module.exports.post = function(req, res) {

  //STEPS TO CREATE A NEW SLIDESHOW

  // 1) create new Slideshow model
  var Slideshow = db.model('Slideshow');
  var slideShowFileHtml;
  var slideShowQuestions

  var newSlideshow = new Slideshow({
    title:req.files.upload.name,
    owner: req.user._id
  });

  // 2) unzip files
  var folderPath = config.rootPath + '/slides/' + newSlideshow._id;
  var zip = new AdmZip(req.files.upload.path);
  zip.extractAllTo(folderPath);

  //3) make sure at least one html exists
  fsUtil.getFirstHtmlFile(folderPath)
    .then(
      function(filePath){
        newSlideshow.originalFile = filePath
        logger.log('will use ' + filePath + ' for main presentation file...');
        return pfs.readFile(filePath)
    })

    //4) parse questions
    .then(    
      function(file) {
        slideShowFileHtml = file;
        logger.log('parsing main .html file for questions...');
        return asqParser.parse(slideShowFileHtml);
    })
    //5) render questions inside to slideshow's html into memory
    .then(
      function(questions){
        slideShowQuestions = questions;
        logger.log('questions successfully parsed');
        return when.all([
          asqRenderer.render(slideShowFileHtml, questions, "teacher"),
          asqRenderer.render(slideShowFileHtml, questions, "student")
          ]);
    })
    //6) store new html with questions to file
    .then(
      function(newHtml){
        var fileNoExt =  folderPath + '/' + path.basename(newSlideshow.originalFile, '.html');
        newSlideshow.teacherFile =  fileNoExt + '.asq-teacher.dust';
        newSlideshow.studentFile =  fileNoExt + '.asq-student.dust';
        
        var filePromises = [
          pfs.writeFile(newSlideshow.teacherFile, newHtml[0]),
          pfs.writeFile(newSlideshow.studentFile, newHtml[1])
         ];

        return  require("promised-io/promise").all(filePromises);

    })
    //7) create new questions for database
    // TODO: create questions only if they exist
    .then(
      function(){
        logger.log('questions successfully rendered to file');
        return questionModel.create(slideShowQuestions)
    })
    //8) add questions to slideshow and persist
    .then(
      function(docs){

        newSlideshow.questions = docs
        return newSlideshow.saveWithPromise();
    })
    //9) remove zip folder
    .then(
      function(doc){
        logger.log('new slideshow saved to db');
        //create thumbs
        logger.log('creating thumbnails')
        createThumb(newSlideshow);
        return pfs.unlink(req.files.upload.path);         
    })
    //10) update slideshows for user
    .then(function(){
      var User = db.model('User');
          return User.findByIdAndUpdate(req.user._id, { $push: {slides : newSlideshow._id } }).exec();
    })
    //11) redirect to user profile page
    .then(
      function(user){
      logger.log('upload zip file unlinked');
      logger.log('upload complete!');
      res.redirect('/user/')
    },

      // Error handling for all the above promises
      function(err){
        pfs.unlink(req.files.upload.path).then(res.redirect('/user/'));
        logger.error(err);
    });

}

function createThumb(slideshow) {
	fs.readFile(slideshow.studentFile, 'utf-8', function(error, data) {
		var ids = [];
		var $ = cheerio.load(data);
		$('.step').each(function() {
			var id = this.attr().id;
			//If slide does not have id, use step-n instead (for url calling)
			if(id == undefined){
				ids.push("step-"+ (ids.length + 1));
			} else {
				ids.push(id);
			}
		});
		
		asyncblock(function(flow){
			fs.mkdirSync('slides/thumbs/' + slideshow._id);
  			for(var i = 0; i < ids.length; i++){
  				console.log("Calling: /usr/local/w2png -W 1024 -H 768 --delay=1 -T -D slides/thumbs/" + slideshow._id + " -o " + i + " -s 0.3 http://localhost:3000/slidesInFrame/" + slideshow._id + "/?url=" + ids[i]);
  				                exec("/usr/local/w2png -W 1024 -H 768 --delay=1 -T -D slides/thumbs/" + slideshow._id + " -o " + i + " -s 0.3 http://localhost:3000/slidesInFrame/" + slideshow._id + "/?url=" + ids[i], flow.add());
  				flow.wait();
  			}
		});
		
	});
}
