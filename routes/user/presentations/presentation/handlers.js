/**
    @fileoverview user/presentations/presentation/handlers.js
    @description Handlers for a presentation resource
*/;
var cheerio     = require('cheerio');
var path        = require('path') ;
var pfs         = require('promised-io/fs');
var lib         = require('../../../../lib');
var sockAuth    = require('../../../../lib/socket/authentication');
var logger      = require('logger-asq');
var presUtils   = lib.utils.presentation;
var config      = require('../../../../config');
var when        = require('when');
var gen         = require('when/generator');
var nodefn      = require('when/node/function');
var Slideshow   = db.model('Slideshow');
var Exercise    = db.model('Exercise');
var User        = db.model('User', schemas.userSchema);
var Session     = db.model('Session');
var stats       = require('../../../../lib/stats/stats');
var Promise     = require("bluebird")  ;
var coroutine   = Promise.coroutine;
var _           = require('lodash');
var settings    = lib.settings.presentationSettings;


function editPresentation(req, res) {
  Slideshow.findById(req.params.presentationId, function(err, slideshow) {
    if (err) {
      logger.error(err.toString());
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
        logger.error('This is an error left unhandeled...');
        logger.error(error.toStirng());
      });
    }
  });
}

function livePresentation(req, res) {
  logger.debug(require('util').inspect(req.whitelistEntry));
  var role = req.query.role || 'viewer'; //Check user is allowed to have this role
  if (req.whitelistEntry !== undefined) {
    role = req.whitelistEntry.validateRole(role); //Demotion of role if too elevated for the user
  } else {
    logger.debug('Public session');
    role = 'viewer'; //Public session and not whitelisted only allows viewers.
  }

  var view = req.query.view || 'presentation'
  var rootUrl = req.app.locals.rootUrl;
  var presentation = req.liveSession.slides;
  var presentationViewUrl = '';
  var presenterLiveUrl = '';

  //TMP until roles are defined more precisely
  logger.debug('Select template for ' + role + ' ' + view);

  var shouldGenerateThumbs = 'true' //string because of dust templates
  if(presentation.thumbnailsUpdated && (presentation.lastEdit - presentation.thumbnailsUpdated < 0 )){
    shouldGenerateThumbs = 'false';
  }

  var renderOpts = (function getTemplate(role, view, presentation) {
      if (view === 'ctrl' && role !== 'viewer') {

        presentationViewUrl = rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          // template: 'presenterControl',
          template: '../client/presenterControl/app/asq.dust',
          namespace: 'ctrl', //change to role
        };
      } else if (role === 'presenter' || role === 'assistant') {
        presentationViewUrl = rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          template:  presentation.asqFilePath,
          namespace: 'ctrl',
          roleScript : '/js/asq-presenter.js'
        };
      } else if (role === 'ghost') {
       presentationViewUrl = rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role + '&view=presentation';
      return {
          template:  presentation.asqFilePath,
          namespace: 'ghost',
          roleScript : '/js/asq-viewer.js'
        };
      } else { //viewer
       presentationViewUrl = rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role + '&view=presentation';
      return {
          template:  presentation.asqFilePath,
          namespace: 'folo',
          roleScript : '/js/asq-viewer.js'
        };
      }

  })(role, view, presentation);

  renderOpts.commonScript = '/js/asq-common.js';

  var token  = sockAuth.createSocketToken({'user': req.user, 'browserSessionId': req.sessionID});
  
  res.render(renderOpts.template, {
    username              : req.user? req.user.username :'',
    title                 : presentation.title,
    host                  : req.app.locals.urlHost,
    port                  : req.app.locals.urlPort,
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
    res.sendFile( path.join(presentation.path, file));
  } else {
    res.send(404, 'Presentation not found, unable to serve attached file.');
  }
}


function startPresentation(req, res, next) {
  logger.debug('New session from ' + req.user.username);

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
      logger.info('Starting new ' + newSession.authLevel + ' session');
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


var stopPresentation = coroutine(function *stopPresentationGen(req, res, next) {

  try{
    logger.debug({
      owner_id: req.user._id,
      slideshow: req.params.presentationId
    }, 'Stopping session');

    var sessionIds = [];
    var sessions = Session.find({
        presenter: req.user._id,
        slides: req.params.presentationId,
        endDate: null
      }).exec();

    yield Promise.map(sessions, function(session){
      session.endDate = Date.now();
      sessionIds.push(session._id.toString());
      return session.save();
    }); 

    // if sessionIds has zero length there was no session
    if (! sessionIds.length) {
      var err404 = Error.http(404, 'No session found', {type:'invalid_request_error'});
      throw err404;
    }
    
    res.sendStatus(204);
    
    logger.log({
      owner_id: req.user._id,
      slideshow: req.params.presentationId,
      sessions: sessionIds,
    }, "stopped session");

  }catch(err){
    logger.error({
      err: err,
      owner_id: req.user._id,
      sessions: sessionIds,
    }, "error stopping session");

    //let error middleware take care of it
    next(err);
  }
});

/* Stats */
var getPresentationStats = gen.lift(function *getPresentationStats(req, res, next) {
  var slideshow ;
  try{
    var slideshow = yield Slideshow.findById(req.params.presentationId).exec();
  }catch(err){
    logger.error("Presentation %s not found", req.params.presentationId);
    logger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  try{
    var statsObj = yield stats.getPresentationStats(slideshow);
    statsObj.presentationId = req.params.presentationId;
    statsObj.username = req.user.username;
    statsObj.host = req.app.locals.urlHost;
    statsObj.port = req.app.locals.urlPort;
    return res.render('presentationStats', statsObj);
  }catch(err){
    logger.error("Presentation %s not found", req.params.presentationId);
    logger.error(err.message, { err: err.stack });
    next(err)
  }
  
});

var getPresentationSettings = coroutine(function* getPresentationSettingsGen(req, res) {

  logger.debug({
    owner_id: req.user._id,
    slideshow: req.params.presentationId
  }, 'get settings of presentation');

  var user        = req.user;
  var userId      = user._id;
  var username    = user.username;

  var slideshowId = req.params.presentationId;

  var slideshow = yield Slideshow.findById(slideshowId).exec();

  if ( ! slideshow ) {
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  var presentationSettings = yield slideshow.getSettings();
  var exerciseSettings = yield settings.getDustSettingsOfExercisesAll(slideshowId);

  // Whether the slideshow is currently active(running) by this user
  var sessionId = yield presUtils.getSessionIfLiveByUser(userId, slideshowId);
  var livelink  = !sessionId ? null : presUtils.getLiveLink(username, slideshowId, sessionId);

  var token  = sockAuth.createSocketToken({'user': req.user, 'browserSessionId': req.sessionID});
  var params = {
      host                 : req.app.locals.urlHost,
      port                 : req.app.locals.urlPort,
      namespace            : '/',
      token                : token,
      browserSesstionId    : req.sessionID,
      
      title                : slideshow.title,
      username             : username,
      slideshowId          : slideshowId,
      livelink             : livelink,
      presentationSettings : presentationSettings,
      exerciseSettings     : exerciseSettings
  };

  res.render('presentationSettings', params);

});



module.exports = {
  editPresentation          : editPresentation,
  livePresentation          : livePresentation,
  livePresentationFiles     : livePresentationFiles,
  startPresentation         : startPresentation,
  stopPresentation          : stopPresentation,
  getPresentationStats      : getPresentationStats,

  getPresentationSettings   : getPresentationSettings,
}
