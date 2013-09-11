/** @module routes/upload
    @description Functions handling upload of new slideshows.
    TODO Handle upload of incrrect slideshows and their removal from the server.
    */

var model         = require('../models')
, slideshowModel  = model.slideshowModel
, questionModel   = model.questionModel
, fs              = require('fs')
, pfs             = require('promised-io/fs')
, cheerio         = require('cheerio')
, AdmZip          = require('adm-zip')
, rimraf          = require('rimraf')
, config          = require('../config')
, lib             = require('../lib')
, appLogger       = lib.logger.appLogger
, asqParser       = lib.asqParser
, asqRenderer     = lib.asqRenderer
, fsUtils         = lib.utils.fs
, when            = require('when')
, path            = require('path')
, _               = require('underscore')
, asyncblock      = require('asyncblock')
, exec            = require('child_process').exec
, mkdirp          = require('mkdirp')
, fn = ('when/function')

module.exports.show = function(req, res) {
  res.render('upload', {username: req.user.name});
}

//MOVED
/*
 * Handle a POST request to the server to upload a new slideshow.
 * This function does all the necessary steps to create a new slideshow
 * with questions
 */
module.exports.post = function(req, res) {

  //STEPS TO CREATE A NEW SLIDESHOW

  // 1) create new Slideshow model
  var Slideshow = db.model('Slideshow')
  , slideShowFileHtml
  , slideShowQuestions
  , parsedQuestions
  , parsedStats;

  var newSlideshow = new Slideshow({
    title : req.files.upload.name,
    owner : req.user._id
  });

  // 2) unzip files
  var folderPath = app.get('uploadDir') + '/' + newSlideshow._id;
  var zip = new AdmZip(req.files.upload.path);
  zip.extractAllTo(folderPath);

  //3) make sure at least one html exists
  fsUtils.getFirstHtmlFile(folderPath)
    .tap(function(filePath){
      newSlideshow.originalFile = filePath;
      appLogger.debug('will use ' + filePath + ' for main presentation file...');
    })
    .then(
      function(filePath){
        return pfs.readFile(filePath);     
    })
    //4) parse questions
    .then(    
      function(file) {
        slideShowFileHtml = file;
        appLogger.debug('parsing main .html file for questions...');
        return asqParser.parse(slideShowFileHtml);
    })
    //5) create new questions for database
    // TODO: create questions only if they exist
    .then(
      function(parsed){
        parsedQuestions = parsed.questions;
        parsedStats = parsed.stats;
        return questionModel.create(parsedQuestions)
    })
    //6) render questions inside to slideshow's html into memory
    .then(
      function(dbQuestions){
        appLogger.debug('questions successfully parsed');

        //copy objectIDs created from mongoose
        _.each(parsedQuestions, function(parsedQuestion, index){
          parsedQuestion.id = dbQuestions[index].id;

           // push questions mongo ids to corresponding questions
          _.each(parsedStats, function(parsedStat){
            if(parsedStat.questionHtmlId == parsedQuestion.htmlId){
              parsedStat.questionId = parsedQuestion.id;
            }
          });
        });

        //hold reference to the db questions
        slideShowQuestions = dbQuestions;

        return when.all([
          asqRenderer.render(slideShowFileHtml, parsedQuestions, "teacher")
          //,
          //asqRenderer.render(slideShowFileHtml, parsedQuestions, "student")
          ]);
    })
    //7) store new html with questions to file
    .then(
      function(newHtml){
        appLogger.debug('presenter and audience files rendered in memory successfully');
        var fileNoExt =  folderPath + '/' + path.basename(newSlideshow.originalFile, '.html');
        newSlideshow.teacherFile =  fileNoExt + '.asq-teacher.dust';
        newSlideshow.studentFile =  fileNoExt + '.asq-student.dust';
        
        var filePromises = [
          pfs.writeFile(newSlideshow.teacherFile, newHtml[0]),
          pfs.writeFile(newSlideshow.studentFile, newHtml[1])
         ];

        return  require("promised-io/promise").all(filePromises);

    })
    //8) add questions to slideshow and persist
    .then(
      function(){
        newSlideshow.questions = slideShowQuestions
        // remember: parsedQuestions and parsedStats now have the question ObjectID
        // created when the mongo questions were created
        newSlideshow.questionsPerSlide = slideshowModel.createQuestionsPerSlide(parsedQuestions)
        newSlideshow.statsPerSlide = slideshowModel.createStatsPerSlide(parsedStats)

        return newSlideshow.saveWithPromise();
    })
    //9) remove zip folder
    .then(
      function(doc){
        appLogger.debug('new slideshow saved to db');
        //create thumbs
        appLogger.debug('creating thumbnails')
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
      appLogger.debug('upload zip file unlinked');
      appLogger.info('upload complete!');
      res.redirect('/user/')
    },

      // Error handling for all the above promises
      function(err){
        appLogger.error("in upload.js: " + err.toString(), {error: err});
        pfs.unlink(req.files.upload.path).then(res.redirect('/user/'));
    });

}

//MOVED
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
			mkdirp.sync(app.get('uploadDir') + '/thumbs/' + slideshow._id);
      var call = new Array();
      call[0] = "/usr/local/w2png -W 1024 -H 768 --delay=1 -T -D ";
      call[1] = app.get('uploadDir') + "/thumbs/";
      call[2] = slideshow._id;
      call[3] = " -o ";
      call = call.join("");

      var url = new Array();
      url[0] = (config.enableHTTPS ? "https://" : "http://");
      url[1] = process.env.HOST;
      url[2] = ":";
      url[3] = process.env.PORT;
      url[4] = "/slidesInFrame/";
      url[5] = slideshow._id;
      url[6] = "/?url=";
      url = url.join("");
      
      for(var i = 0; i < ids.length; i++){
        appLogger.debug("calling: " + call + i + " -s 0.3 " + url + ids[i]);
        exec(call + i + " -s 0.3 " + url + ids[i], flow.add());
  			flow.wait();
      }
		});
		
	});
}
