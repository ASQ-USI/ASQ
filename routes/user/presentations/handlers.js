require('when/monitor/console');
var _             = require('lodash')
, AdmZip          = require('adm-zip')
, cheerio         = require('cheerio')
, dust            = require('dustjs-linkedin')
, microformat     = require('asq-microformat')
, Parser          = microformat.parser
, MarkupGenerator = microformat.generator
, moment          = require('moment')
, nodefn          = require('when/node/function')
, path            = require('path')
, pfs             = require('promised-io/fs')
, fs              = require('fs')
, when            = require('when')
, errorTypes      = require('../../errorTypes')
, lib             = require('../../../lib')
, dustHelpers     = lib.dustHelpers
, appLogger       = lib.logger.appLogger
, fsUtils         = lib.utils.fs
, utils           = lib.utils.routes
, questionModel   = require('../../../models/question') //TODO fix and remove this require
//, thumbUtils      = require('./utils') //TODO Fix thumbs
, Question        = db.model('Question')
, Rubric          = db.model('Rubric')
, Exercise        = db.model('Exercise')
, Slideshow       = db.model('Slideshow')
, Session         = db.model('Session')
, User            = db.model('User')
, getPresentationsByCourse = require('./utils').getPresentationsByCourse;

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
      next(Error.http(404, 'Invalid presentation Id', {type:'invalid_request_error'}));
  })
  .then(

  //success response
  function onRemoved(removed){
    //JSON
    if(req.accepts('application/json')){
      res.json({
        "id": removed._id,
        "deleted": true
      });
      return;
    }
    //HTML
    res.redirect('/' + req.user.username +
      '/presentations/?alert=Slideshow deleted&type=success');
  },

  //err response
  function onError(err){
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
      res.redirect(301, '/' + req.user.username + '/presentations/' + id + '/');
    } else if (slideshow) {
      res.sendfile(slideshow.path + req.params[0]);
    } else {
      res.send(404, 'Slideshow not found, unable to serve attached file.');
    }
  });
}

function listPresentations(req, res, next) {
  appLogger.debug('list presentations');

  getPresentationsByCourse(req.user._id, Session, Slideshow)
  .then(function(slidesByCourse){
    var type = utils.getAlertTypeClass(req);

    res.render('presentations', {
       username        : req.user.username,
       slidesByCourses : slidesByCourse,
       JSONIter        : dustHelpers.JSONIter,
       host            : ASQ.appHost,
       port            : app.get('port'),
       //id              : req.user.current,
       alert           : req.query.alert,
       type            : type,
       //session         : req.user.current
     });
  })
  .catch(function onError(err) {
    appLogger.error( err.toString(), { err: err.stack });
  });
}

function updatePresentation(req, res, next) {
  appLogger.error('NOT IMPLEMENTED: Updating a presentation is not supported.');
  res.send(405, 'Cannot update a presentation so far...');
}

function uploadPresentation(req, res, next) {
  //STEPS TO CREATE A NEW SLIDESHOW

  // 1) create new Slideshow model
  var questionIdsMap = {} //To map html id to object ids of questions
  , slideShowFileHtml
  , slideShowQuestions
  , parsedExercises
  , parsedQuestions
  , parsedRubrics
  , parsedStats;

  var newSlideshow = new Slideshow({
    title : req.files.upload.name,
    owner : req.user._id
  });

  // 2) unzip files
  var folderPath = app.get('uploadDir') + '/' + newSlideshow._id;
  var zip = new AdmZip(req.files.upload.path);
  zip.extractAllTo(folderPath);

  // 3) make sure at least one html exists
  fsUtils.getFirstHtmlFile(folderPath)
    .tap(function(filePath){
      newSlideshow.originalFile = path.basename(filePath);
      appLogger.debug('will use ' + filePath + ' as main presentation file...');
    })
    .then(
      function(filePath){
        return pfs.readFile(filePath);
    })
    // 4) parse questions
    .then(
      function(file) {
        slideShowFileHtml = file;

        //get slides Tree
        var adapter = require('../../../lib/presentationAdapter/adapters').impressAsqFork
        //newSlideshow.slidesTree = adapter.getSlidesTree(file);

        function replaceAll(find, replace, str) {
          return str.replace(new RegExp(find, 'g'), replace);
        }
        slideShowFileHtml = slideShowFileHtml.toString();
        // Escape brackets otherwise dust will try to parse them
        slideShowFileHtml = replaceAll('{','ESCAPEFORDUSTBRACKETSASQ',slideShowFileHtml)
        slideShowFileHtml = replaceAll('}','{~rb}',slideShowFileHtml)
        slideShowFileHtml = replaceAll('ESCAPEFORDUSTBRACKETSASQ','{~lb}',slideShowFileHtml)

        appLogger.debug('parsing main .html file for questions...');
        return (new Parser(appLogger)).parse(slideShowFileHtml, { wrap: false });
    })
    // 5) create new questions for database
    // TODO: create questions only if they exist
    .then(
      function(parsed) {
        // Check for parsing errors and fail if there are some.
        if (parsed.errors) {
          return when.reject(new Error(
            'Parsing failed with the following errors: \n - ' +
            parsed.errors.join('\n - ')
          ));
        }

        slideShowFileHtml  = parsed.html

        //update original file with any corrections from parser
        var fPath = folderPath + '/' +  newSlideshow.originalFile;
        fs.writeFileSync(fPath, slideShowFileHtml)

        var dbQuestions =  [];
        parsedExercises = parsed.exercises
        parsedRubrics   = parsed.rubrics;
        parsedStats     = parsed.stats;

        //create questions and exercises
        return when.map(parsedExercises, function(exercise) {
          return Question.create(exercise.questions).then(function() {
              var createdQuestions = [].slice.call(arguments);

              exercise.questions.each(function(q, i) {
                //add db ids
                q.id = createdQuestions[i].id
                //map question html ids to database id
                questionIdsMap[q.htmlId] = createdQuestions[i].id;
              });
              dbQuestions = dbQuestions.concat(createdQuestions);
              return Exercise.create({
                  assessmentTypes : exercise.assessmentTypes,
                  questions       : createdQuestions.map(function(q) {
                    return q._id;
                  })
                }).then(function setExIds(dbExercise) {
                exercise.id = dbExercise.id;
                return when.resolve(dbExercise);
              });
            })
        }).then(function() {
          parsedQuestions = [];
          parsed.exercises.each(function(exercise) {
            parsedQuestions = parsedQuestions.concat(exercise.questions)
          })
          return when.resolve(dbQuestions);
        }).then(null, function onError(err) {
          return when.reject(err);
        });

        // parsedQuestions =  [];
        // parsed.exercises.each(function(exercise){
        //   parsedQuestions= parsedQuestions.concat(exercise.questions)
        // })
        // // parsedQuestions = parsed.questions;
        // parsedRubrics   = parsed.rubrics;
        // parsedStats     = parsed.stats;
        // var deferred = when.defer();
        // Question.create(parsedQuestions).then(
        //   function(ques) {
        //     deferred.resolve(ques); },
        //   function(err) { deferred.reject(err); });
        // return deferred.promise;
    })
    // 6) Update question refs in rubrics and stats with db ids.
    .then(
      function(dbQuestions){
        appLogger.debug('questions successfully parsed');
        // Update questions ids from HTML to db objects and save the mapping in
        // memory for further processing (rubrics and stats).
        // NOTE: this relies on the db array to maintain the same order as
        // the parsed array. While there is no indication it is not kept,
        // there is no indication it is either... To check!
        // var i = parsedQuestions.length;
        // while(i--) {
        //   questionIdsMap[parsedQuestions[i].htmlId] = dbQuestions[i].id;
        //   parsedQuestions[i].id = dbQuestions[i].id;
        // }

        // Update stats refs to question using the HTML-ObjectId mapping
        // generated before.
        var i = parsedStats.length;
        while(i--) {
          var htmlId = parsedStats[i].questionHtmlId;
          if (! questionIdsMap.hasOwnProperty(htmlId)) {
            return when.reject(new Error([
              'Invalid question Id reference "', htmlId,
              '" for stats on slide "', parsedStats[i].slideHtmlId, '".'
            ].join('')));
          }
          parsedStats[i].questionId = questionIdsMap[htmlId];
        }

        // Update rubrics refs to question using the HTML-ObjectId mapping
        // generated before.
        i = parsedRubrics.length;
        while(i--) {
          var qId = parsedRubrics[i].question;
          if (! questionIdsMap.hasOwnProperty(qId)) {
            return when.reject(new Error([
              'Invalid question Id reference "', qId,
              '"for rubrics on slide "', parsedRubrics[i].stemText, '".'
            ].join('')));
          }
          parsedRubrics[i].question = questionIdsMap[qId];
        }

        //hold reference to the db questions
        slideShowQuestions = dbQuestions;

        return Rubric.create(parsedRubrics); //Dump rubrics in db
    }).then( // 7) Render templates of slideshow for presenter and viewer.
      function onSavedRubrics(dbRubrics) {
        //console.log(dbRubrics)
        return when.all([
          (new MarkupGenerator(dust)).render(slideShowFileHtml,
            parsedExercises, dbRubrics, { userType : 'presenter' }),
          (new MarkupGenerator(dust)).render(slideShowFileHtml,
            parsedExercises, dbRubrics, { userType : 'viewer' })
        ]);
    })
    // 8) store new html with questions to file
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
    // 9) add questions to slideshow and persist
    .then(
      function(){
        newSlideshow.questions = slideShowQuestions
        // remember: parsedQuestions and parsedStats now have the question ObjectID
        // created when the mongo questions were created
        newSlideshow.setQuestionsPerSlide(parsedQuestions);
        newSlideshow.setStatsPerSlide(parsedStats);

        return newSlideshow.saveWithPromise();
    })
    // 10) remove zip folder
    .then(
      function(doc){
        appLogger.debug('new slideshow saved to db');
        //create thumbs
        appLogger.debug('creating thumbnails')
       // thumbUtils.createThumbs(newSlideshow);
        return pfs.unlink(req.files.upload.path);
    })
    // 11) update slideshows for user
    .then(function(){
      return User.findByIdAndUpdate(req.user._id, {
        $push: { slides : newSlideshow._id }
      }).exec();
    })
    //12) redirect to user profile page
    .then(
      function(user){
        appLogger.debug('upload zip file unlinked');
        appLogger.info(newSlideshow.title + ' uploaded successfully!');
        res.redirect(303, ['/', req.user.username, '/presentations/?alert=',
            newSlideshow.title, ' uploaded successfully!&type=success']
            .join(''));
    },
    // Error handling for all the above promises
    function(err){
      pfs.unlink(req.files.upload.path).then(function() {
        next(err);
        // res.redirect(['/', req.user.username, '/presentations/?alert=',
        //     err.toString(), '&type=error'].join(''))
      });
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
