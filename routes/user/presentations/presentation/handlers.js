/**
    @fileoverview user/presentations/presentation/handlers.js
    @description Handlers for a presentation resource
*/
var cheerio     = require('cheerio')
  , path        = require('path') 
  , pfs         = require('promised-io/fs')
  , lib         = require('../../../../lib')
  , sockAuth    = require('../../../../lib/socket/authentication')
  , appLogger   = lib.logger.appLogger
  , presUtils   = lib.utils.presentation
  , config      = require('../../../../config')
  , when        = require('when')
  , gen         = require('when/generator')
  , nodefn      = require('when/node/function')
  , Slideshow   = db.model('Slideshow')
  , Exercise    = db.model('Exercise')
  , User        = db.model('User', schemas.userSchema)
  , Session     = db.model('Session')
  , stats       = require('../../../../lib/stats/stats')
  , Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine
  , _           = require('lodash')
  , assessmentTypes = require('../../../../models/assessmentTypes.js')
  , slideflowTypes = require('../../../../models/slideflowTypes.js')
  , Conf        = require('../../../../lib/configuration/conf.js');


function editPresentation(req, res) {
  Slideshow.findById(req.params.presentationId, function(err, slideshow) {
    if (err) {
      appLogger.error(err.toString());
    } else {
      /* Load presentation html file */
      pfs.readFile(slideshow.presenterFile, 'utf-8').then(function(data) {

        //Array with one field per slide. Each field has questions and stats
        var slides = [];
        $ = cheerio.load(data);
        $('.step').each(function(slide) {
          //Get questions on this slide. Get their text and push it into an array
          var questionsOnSlide = new Array();
          $(this).find('.assessment').each(function(el) {
            var text = $(this).find('.stem').first().text();
            if (text == undefined || text.length == 0) {
              text = 'Missing question text';
            }
            questionsOnSlide.push(text);
          });

          //Get stats on this slide. Get their text and push it into an array
          var statsOnSlide = new Array();
          $(this).find('.stats').each(function(el) {
            var text = $(this).find('.stem').first().text();
            if (text == undefined || text.length == 0) {
              text = 'Missing question text';
            }
            statsOnSlide.push(text);
          });

          //Push questions and stats on this slide into array
          slides.push({
            questions : questionsOnSlide,
            stats     : statsOnSlide
          });
        });

        res.render('edit', {
          title     : slideshow.title,
          slides    : slides,
          slideshow : slideshow,
        });
      }, function(error){
        //TODO How about handling the error?
        appLogger.error('This is an error left unhandeled...');
        appLogger.error(error.toStirng());
      });
    }
  });
}

function livePresentation(req, res) {
  appLogger.debug(require('util').inspect(req.whitelistEntry));
  var role = req.query.role || 'viewer'; //Check user is allowed to have this role
  if (req.whitelistEntry !== undefined) {
    role = req.whitelistEntry.validateRole(role); //Demotion of role if too elevated for the user
  } else {
    appLogger.debug('Public session');
    role = 'viewer'; //Public session and not whitelisted only allows viewers.
  }
  var view                = req.query.view || 'presentation'
    , presentation        = req.liveSession.slides
    , presentationViewUrl = ''
    , presentationDir = app.get('uploadDir') + '/' + presentation._id + '/'
    , presentationFile = presentationDir + presentation.asqFile
    , presenterLiveUrl    = '';

  //TMP until roles are defined more precisely
  appLogger.debug('Select template for ' + role + ' ' + view);

  var shouldGenerateThumbs = 'true' //string because of dust templates
  if(presentation.thumbnailsUpdated && (presentation.lastEdit - presentation.thumbnailsUpdated < 0 )){
    shouldGenerateThumbs = 'false';
  }

  var renderOpts = (function getTemplate(role, view, presentation) {
      if (view === 'ctrl' && role !== 'viewer') {

        presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          // template: 'presenterControl',
          template: '../client/presenterControlPolymer/app/asq.dust',
          namespace: 'ctrl', //change to role
        };
      } else if (role === 'presenter' || role === 'assistant') {
        presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          template: presentationFile,
          namespace: 'ctrl',
          roleScript : '/js/asq-presenter.js'
        };
      } else if (role === 'ghost') {
       presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role + '&view=presentation';
      return {
          template: presentationFile,
          namespace: 'ghost',
          roleScript : '/js/asq-viewer.js'
        };
      } else { //viewer
       presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role + '&view=presentation';
      return {
          template: presentationFile,
          namespace: 'folo',
          roleScript : '/js/asq-viewer.js'
        };
      }

  })(role, view, presentation);

  renderOpts.commonScript = '/js/asq-common.js';

  var token  = sockAuth.createSocketToken({'user': req.user, 'browserSessionId': req.sessionID});
  console.log( renderOpts.template, token);
  res.render(renderOpts.template, {
    username              : req.user? req.user.username :'',
    title                 : presentation.title,
    host                  : ASQ.urlHost,
    port                  : ASQ.urlPort,
    namespace             : renderOpts.namespace,
    commonScript          : renderOpts.commonScript,
    roleScript            : renderOpts.roleScript,
    role                  : role,
    presentation          : presentation._id,
    shouldGenerateThumbs  : shouldGenerateThumbs,
    slideTree             : JSON.stringify(presentation.slidesTree),
    presentationId        : presentation._id,
    id                    : req.liveSession.id,
    token                 : token,
    userSessionId         : req.whitelistEntry.id,
    date                  : req.liveSession.startDate,
    presentationViewUrl   : presentationViewUrl,
    presenterLiveUrl      : presenterLiveUrl
  });
}

function livePresentationFiles(req, res) {
  var presentation = req.liveSession.slides;
  var file = req.params[0];
  if (presentation && file === presentation.originalFile) {
    res.redirect(301, ['/', req.user.username, '/presentations/',
        req.params.presentationId, '/live/', req.params.liveId,
        '/?view=presentation'].join(''));
  } else if(presentation) {
    res.sendFile( presentation.path + file, {root: app.get('rootDir')});
  } else {
    res.send(404, 'Presentation not found, unable to serve attached file.');
  }
}


function startPresentation(req, res, next) {
  appLogger.debug('New session from ' + req.user.username);

  var  slidesId = req.params.presentationId
    , newSession;

  //Find slideshow
  Slideshow.findOne({
    _id   : slidesId,
    owner : req.user._id })
  .exec()
  .then(
    function(slideshow){
      if(!slideshow){
        return when.reject(new Error('No slideshow with this id'))
      } //FIXME create proper error like in list presentations

      slideshow.lastSession = new Date();

      //Instantiate a new session
      newSession = new Session();
      newSession.presenter = req.user._id;
      newSession.slides = slideshow._id;
      newSession.flow = ( Session.schema.path('flow').enumValues
        .indexOf(req.body.flow) > -1 ) ? req.body.flow : 'ctrl';
      newSession.authLevel = ( Session.schema.path('authLevel').enumValues
        .indexOf(req.body.authLevel) > -1 ) ? req.body.authLevel : 'public';
      //update liveSessions of user
      var userPromise = User.findById(req.user._id).exec()
      .then(
        function onUser(user){
          if(!user){
            return when.reject(new Error('No user with this id'))
          } //FIXME create proper error like in list presentations
          // user.current = (newSession._id)
          // user.liveSessions.addToSet(newSession._id)
          return user.save()
        }
      );

      return when.all([
        slideshow.save(),
        newSession.save(),
        userPromise
      ]);
    }
  ).then(
    function generateWhitelist(){
      return nodefn.call(presUtils.generateWhitelist[newSession.authLevel]
          , newSession._id, req.user)
    }
  ).then(
    function sendReponse(){
      appLogger.info('Starting new ' + newSession.authLevel + ' session');
      res.location(['/', req.user.username, '/presentations/', newSession.slides,
        '/live/', newSession._id, '/?role=presenter&view=ctrl'].join(''));
      console.log(['/', req.user.username, '/presentations/', newSession.slides,
        '/live/', newSession._id, '/?role=presenter&view=ctrl'].join(''));
      res.sendStatus(201);
    },
    function errorHandler(err){
      next(err)
    }
  );
}

function stopPresentation(req, res, next) {
  appLogger.debug('Stopping session from ' + req.user.username);
  return res.sendStatus(204)
  //start with when to have the catch method at the end;
  when.resolve(true)
  .then(function(){
    return Session.find({
      presenter: req.user._id,
      slides: req.params.presentationId,
      endDate: null
    }).exec()
  })
  .then(function(sessions){ 
    //DELETE is idempotent so even id we don't have a live session
    // we can still return success
    return when.map(sessions, function(session){
      session.endDate = Date.now();
      return session.save();
    })
  }).then(
    function onStopped(){
      appLogger.info('Session stopped');

       //JSON
    if(req.accepts('application/json')){
      return res.sendStatus(204);
    }
    //HTML
      res.sendStatus(204);
  }).catch(function onError(err){
    next(err)
  });
}

/* Stats */
var getPresentationStats = gen.lift(function *getPresentationStats(req, res, next) {
  var slideshow ;
  try{
    var slideshow = yield Slideshow.findById(req.params.presentationId).exec();
  }catch(err){
    appLogger.error("Presentation %s not found", req.params.presentationId);
    appLogger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  try{
    var statsObj = yield stats.getPresentationStats(slideshow);
    statsObj.presentationId = req.params.presentationId;
    statsObj.username = req.user.username;
    statsObj.host = ASQ.appHost;
    statsObj.port = app.get('port');
    return res.render('presentationStats', statsObj);
  }catch(err){
    appLogger.error("Presentation %s not found", req.params.presentationId);
    appLogger.error(err.message, { err: err.stack });
    next(err)
  }
  
});

var getConf = coroutine(function* getConf(conf) {
  var slideConf = [];
  for (var key in conf) {
    if (conf.hasOwnProperty(key)) {
      // input: select
      if ( key == "slideflow" || key == "assessment") {
        var type = "select";
        var options;
        if ( key == "slideflow" ) options = slideflowTypes; 
        if ( key == "assessment" ) options = assessmentTypes;         
   
        var newOptions = [];
        for ( var i=0; i<options.length; i++ ) {
          newOptions.push({
            option   : options[i],
            selected : options[i] == conf[key]
          });
        }
       
        slideConf.push({
          id: key.toLowerCase(),
          key: key,
          type: type,
          value: null,
          options: newOptions
        })
      }
      // input: number
      if ( key == "maxNumSubmissions" ) {
        var type = "number";
        slideConf.push({
          id: key.toLowerCase(),
          key: key,
          type: type,
          value: conf[key]
        })
      }
    }
  }

  return slideConf
});


var transform = coroutine(function* transform(slides) {
  var data = [];
  for (var key in slides) {
    if (slides.hasOwnProperty(key)) {
      var slide = {
        index: key,
        exercises: []
      };
      
      for ( var i=0; i<slides[key].length; i++ ) {
        var exObject = yield Exercise.findById(slides[key][i]).exec();
        var exercise = {};
        exercise.uid = slides[key][i]; 
        exercise.names = ['maxNumSubmissions', 'confidence'];
        exercise.maxNumSubmissions = exObject.maxNumSubmissions;
        exercise.confidence = exObject.confidence;
        slide.exercises.push(exercise);
      }
      data.push(slide)
    }
  }
  return data.reverse();
});

var isSlideshowActiveByUser = coroutine(function* isSlideshowActiveByUser(slideshowId, userId) {
  var query = {
    'presenter': userId,
    'slides': slideshowId,
    'endDate': null
  }
  var sesstions = yield Session.find(query).exec();
  if ( !sesstions || sesstions.length == 0 ) {
    return { flag: false }
  }
  return { flag: true, sessions: sesstions }
});


var putPresentationSettings = coroutine(function* putPresentationSettingsGen(req, res) {
  return res.json({msg: "Alles gut"});
});

var configurePresentation = coroutine(function* configurePresentation(req, res) {
  var slideshowId = req.params.presentationId;
  var slideshow;
  try{
    var slideshow = yield Slideshow.findById(slideshowId).exec();
  }catch(err){
    appLogger.error("Presentation %s not found", req.params.presentationId);
    appLogger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  var slideConf = yield getConf(slideshow.configuration);
  var data = yield transform(slideshow.exercisesPerSlide);
  var username = req.user.username;

  var param = {
    title: slideshow.title,
    username: username,
    slideshowId: slideshowId,
    slideConf: slideConf,
    data: data
  }

  // Whether the slideshow is currently active(running) by this user
  var result = yield isSlideshowActiveByUser(slideshowId, req.user._id);
  if ( !result.flag ) {
    res.render('presentationSettings', param);
  } else {
    var sessionId = result.sessions[0]._id;
    var livelink = ['/', req.user.username,'/presentations/', slideshowId, '/live/', sessionId, '/?role=presenter&view=presentation'].join('');
    param.livelink = livelink;
    res.render('presentationSettingsRuntime', param);
  }
   
});

var configurePresentationSaveExercise = coroutine(function* configurePresentationSaveExercise(req, res) {
  var exerciseId = req.body.uid;
  var slideshowId = req.params.presentationId;
  // TODO: not to hardcode
  // 
  var conf = {
    maxNumSubmissions: Number(req.body.max) ? Number(req.body.max) : 0,
    confidence: req.body.hasOwnProperty('confidence')
  }

  var state = yield Conf.updateExerciseConf(slideshowId, exerciseId, conf);

  if ( state ) {
    var url = '/' + req.user.username + '/presentations/' + req.params.presentationId + '/settings/';
    res.redirect(url);
  } else {
    res.send(req.body);
  }
});

var configurePresentationSaveExerciseRuntime = coroutine(function* configurePresentationSaveExercise(req, res) {
  var exerciseId = req.body.uid;
  var slideshowId = req.params.presentationId;
  // TODO: not to hardcode
  // 
  var conf = {
    maxNumSubmissions: Number(req.body.max) ? Number(req.body.max) : 0,
    confidence: req.body.hasOwnProperty('confidence')
  }

  var state = yield Conf.updateExerciseConfRuntime(slideshowId, exerciseId, conf);
  var state = false;
  if ( state ) {
    // var url = '/' + req.user.username + '/presentations/' + req.params.presentationId + '/settings/';
    // res.redirect(url);
  } else {
    res.send(req.body);
  }
});

var configurePresentationSaveSlideshow = coroutine(function* configurePresentationSaveSlideshow(req, res) {
  var state = yield Conf.updateSlideshowConf(req.body, req.params.presentationId);

  if ( state ) {
    var url = '/' + req.user.username + '/presentations/' + req.params.presentationId + '/settings/';
    res.redirect(url);
  } else {
    res.send(req.body);
  }
  
});

module.exports = {
  editPresentation          : editPresentation,
  livePresentation          : livePresentation,
  livePresentationFiles     : livePresentationFiles,
  startPresentation         : startPresentation,
  stopPresentation          : stopPresentation,
  getPresentationStats      : getPresentationStats,
  configurePresentation     : configurePresentation,
  putPresentationSettings   : putPresentationSettings,
  configurePresentationSaveExercise : configurePresentationSaveExercise,
  configurePresentationSaveExerciseRuntime : configurePresentationSaveExerciseRuntime,
  configurePresentationSaveSlideshow: configurePresentationSaveSlideshow
}