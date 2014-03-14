require('when/monitor/console');
var AdmZip          = require('adm-zip')
  , cheerio         = require('cheerio')
  , moment          = require('moment')
  , path            = require('path')
  , pfs             = require('promised-io/fs')
  , _               = require('lodash')
  , when            = require('when')
  , nodefn          = require('when/node/function')
  , lib             = require('../../../lib')
  , dustHelpers     = lib.dustHelpers
  , appLogger       = lib.logger.appLogger
  , Parser          = lib.assessment.parser
  , MarkupGenerator = lib.assessment.markupGenerator
  , fsUtils         = lib.utils.fs
  , Slideshow       = db.model('Slideshow')
  , User            = db.model('User')
  , Session         = db.model('Session')
  , model           = require('../../../models')
  , slideshowModel  = model.slideshowModel
  , questionModel   = model.questionModel
  , utils           = require('./utils')
  , errFormatter    = require('../../../lib/utils/responseHelper').restErrorFormatter
  , errorTypes      = require('../../errorTypes');

function deletePresentation(req, res, next) {
  errorTypes.add('invalid_request_error');

  Slideshow.findOne({
    _id   : req.params.presentationId,
    owner : req.user._id
  }).exec()
  .then(

  //validate slideshow
  function(slideshow) {
      if (slideshow) return nodefn.call(slideshow.remove.bind(slideshow));
      //no slideshow
      next(Error.create().http(404, 'Invalid presentation Id', {type:'invalid_request_error'}));
  })
  .then(

  //success response
  function(removed){
    //JSON
    if(req.accepts('application/json')){
      res.json({
        "id": removed._id,
        "deleted": true
      });
      return;
    }
    //HTML
    res.redirect('/' + req.user.name +
      '/presentations/?alert=Slideshow deleted&type=succes');
  },

  //err response
  function(err){
    if(err) return next(err) 
  });
}

function getPresentation(req, res, next) {
  appLogger.debug(req.liveSession);
  var id = req.params.presentationId;

  Slideshow.findById(id, function(err, slideshow) {
    if(slideshow){
      res.sendfile(slideshow.path + path.basename(slideshow.originalFile));
    
    }else{
      res.send(404, 'Slideshow not found');
    }
  });
}

function getPresentationFiles(req, res, next) {
  var id = req.params.presentationId;
  Slideshow.findById(id, function(err, slideshow) {
    if (slideshow && req.params[0] == slideshow.originalFile) {
      res.redirect(301, '/' + req.user.name + '/presentations/' + id + '/');
    } else if (slideshow) {
      res.sendfile(slideshow.path + req.params[0]);
    } else {
      res.send(404, 'Slideshow not found, unable to serve attached file.');
    }
  });
}

function listPresentations(req, res, next) {
  appLogger.debug('list presentations');
  // var userPromise = User.findOne({
  //   _id: req.user._id,
  // }, 'liveSessions')
  // .populate('liveSessions')
  // .exec();

  var sessionPromise = Session.getLiveSessions(req.user._id);

  var slideshowPromise = Slideshow.find({
    owner : req.user._id
  }, '_id title course lastSession lastEdit').exec();

  when.all([sessionPromise, slideshowPromise])
  .then(
    function onAll(results){
      processPresentations(results[0], results[1]);
    }
  );

  function processPresentations(sessions, slides) {
    var live={};
    sessions.forEach(function(session){
      live[session.slides.toString()]=true;
    });

    var slidesByCourse = null; //to evaluate as false in dustjs

    if (typeof slides != "undefined"
          && slides != null
          && slides.length > 0) {
      slidesByCourse = {};
      for (var i = 0; i < slides.length; i++) {
        var slideshow = slides[i].toJSON();
        if (!live.hasOwnProperty(slideshow._id)) {
          slideshow.isLive = false;
        }else{
          slideshow.isLive = live[slideshow._id]
        }

        if (!slidesByCourse.hasOwnProperty(slideshow.course)) {
          slidesByCourse[slideshow.course] = [];
        }
        slideshow.lastEdit = moment( slideshow.lastEdit)
            .format('DD.MM.YYYY HH:mm');
        slideshow.lastSession = moment( slideshow.lastSession)
            .format('DD.MM.YYYY HH:mm');
        slidesByCourse[slideshow.course].push(slideshow);
      }
    }

    var type = req.query.type && /(succes|error|info)/g.test(req.query.type) 
        ? 'alert-' + req.query.type : '';

    res.render('presentations', {
      username        : req.user.name,
      isOwner         : req.isOwner,
      slidesByCourses : slidesByCourse,
      JSONIter        : dustHelpers.JSONIter,
      host            : ASQ.appHost,
      port            : app.get('port'),
      //id              : req.user.current, //FIXME: remove?
      alert           : req.query.alert,
      type            : type,
      //session         : req.user.current
    });
  }
}

function updatePresentation(req, res, next) {
  appLogger.error('NOT IMPLEMENTED: Updating a presentation is not supported.');
  res.send(405, 'Cannot update a presentation so far...');
}

function uploadPresentation(req, res, next) {
  //STEPS TO CREATE A NEW SLIDESHOW

  // 1) create new Slideshow model
  var slideShowFileHtml
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
      newSlideshow.originalFile = path.basename(filePath);
      appLogger.debug('will use ' + filePath + ' as main presentation file...');
    })
    .then(
      function(filePath){
        return pfs.readFile(filePath);
    })
    //4) parse questions
    .then(
      function(file) {
        slideShowFileHtml = file;
        function replaceAll(find, replace, str) {
          return str.replace(new RegExp(find, 'g'), replace);
        }
        slideShowFileHtml = slideShowFileHtml.toString();
        slideShowFileHtml = replaceAll('{','ESCAPEFORDUSTBRACKETSASQ',slideShowFileHtml)
        slideShowFileHtml = replaceAll('}','{~rb}',slideShowFileHtml)
        slideShowFileHtml = replaceAll('ESCAPEFORDUSTBRACKETSASQ','{~lb}',slideShowFileHtml)
       // console.log(slideShowFileHtml)

        appLogger.debug('parsing main .html file for questions...');
        return (new Parser).parse(slideShowFileHtml);
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
          (new MarkupGenerator()).render(slideShowFileHtml,
                                         parsedQuestions,
                                        {userType:'presenter'})
          , (new MarkupGenerator()).render(slideShowFileHtml,
                                         parsedQuestions,
                                        {userType:'viewer'})
          ]);
    })
    //7) store new html with questions to file
    .then(
      function(newHtml){
        appLogger.debug('presenter and audience files rendered in memory '
            + 'successfully');
        var fileNoExt =  folderPath + '/'
            + path.basename(newSlideshow.originalFile, '.html');
        newSlideshow.presenterFile =  fileNoExt + '.asq-presenter.dust';
        newSlideshow.viewerFile =  fileNoExt + '.asq-viewer.dust';
        
        var filePromises = [
          pfs.writeFile(newSlideshow.presenterFile, newHtml[0]),
          pfs.writeFile(newSlideshow.viewerFile, newHtml[1])
         ];

        return  require('promised-io/promise').all(filePromises);

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
       // utils.createThumbs(newSlideshow);
        return pfs.unlink(req.files.upload.path);         
    })
    //10) update slideshows for user
    .then(function(){
      return User.findByIdAndUpdate(req.user._id, {
        $push: { slides : newSlideshow._id }
      }).exec();
    })
    //11) redirect to user profile page
    .then(
      function(user){
        appLogger.debug('upload zip file unlinked');
        appLogger.info(newSlideshow.title + ' uploaded successfully!');
        res.redirect(['/', req.user.name, '/presentations/?alert=',
            newSlideshow.title, ' uploaded successfully!&type=success']
            .join(''));
    },
    // Error handling for all the above promises
    function(err){
      next(err)
      pfs.unlink(req.files.upload.path).then(
        res.redirect(['/', req.user.name, '/presentations/?alert=',
            err.toString(), '&type=error'].join(''))
      );
    });
}


module.exports = {
  deletePresentation   : deletePresentation,
  getPresentation      : getPresentation,
  getPresentationFiles : getPresentationFiles,
  listPresentations    : listPresentations,
  updatePresentation   : updatePresentation,
  uploadPresentation   : uploadPresentation
}