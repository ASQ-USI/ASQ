/**
    @fileoverview user/presentations/presentation/handlers.js
    @description Handlers for a presentation resource
*/;
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const fs = Promise.promisifyAll(require('fs'));
const cheerio = require('cheerio');
const path = require('path') ;
const _  = require('lodash');
const logger = require('logger-asq');
const lib = require('../../../../lib');
const presUtils = lib.utils.presentation;
const config = require('../../../../config');
const Slideshow = db.model('Slideshow');
const Exercise = db.model('Exercise');
const User = db.model('User', schemas.userSchema);
const Session = db.model('Session');
const Question = db.model('Question');
const stats = require('../../../../lib/stats/stats');
const settings  = lib.settings.presentationSettings;
const presentationApi = require('../../../../lib/api/presentations.js');
const archive = require('../../../../lib/download/archive.js');
const filenamify = require('filenamify');


function editPresentation(req, res) {
  Slideshow.findById(req.params.presentationId, function(err, slideshow) {
    if (err) {
      logger.error(err.toString());
    } else {
      /* Load presentation html file */
      fs.readFileAsync(slideshow.presenterFile, 'utf-8').then(function(data) {

        //Array with one field per slide. Each field has questions and stats
        const slides = [];
        $ = cheerio.load(data);
        $('.step').each(function(slide) {
          //Get questions on this slide. Get their text and push it into an array
          const questionsOnSlide = [];
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
        logger.error(error.toString());
      });
    }
  });
}


/**
* This function renders the appropriate view of a live presentation.
* To decide which view to render:
* a) it checks the query string for `role` and `view` variables. Defaults
* are `viewer` and `presentation` respectively.
* b) It then does a authorization
* check to see if the user has the `role` they claim. 
* Notice that for the cockpit view, we redirect in order to get rid of 
* the query string which causes trouble in the clientside routing lib of
* the cockpit.
*/
function livePresentation(req, res) {
  let role = req.query.role || 'viewer'; //Check user is allowed to have this role
  if (req.whitelistEntry !== undefined) {
    role = req.whitelistEntry.validateRole(role); //Demotion of role if too elevated for the user
  } else {
    logger.debug('Public session');
    role = 'viewer'; //Public session and not whitelisted only allows viewers.
  }

  const view = req.query.view || 'presentation'
  const rootUrl = req.app.locals.rootUrl;
  const presentation = req.liveSession.slides;
  let presentationViewUrl = '';
  const presenterLiveUrl = rootUrl + '/' + req.routeOwner.username + '/live/';

  //bail out early if we need to renderthe cockpit
  if (view === 'cockpit' && role !== 'viewer') {
    return  res.redirect(301, ['/', req.user.username, '/presentations/',
        req.params.presentationId, '/live/', req.params.liveId,
        '/cockpit'].join(''));
  }

  //TMP until roles are defined more precisely
  logger.debug('Select template for ' + role + ' ' + view);

  const renderOpts = (function getTemplate(role, view, presentation) {
    presentationViewUrl = rootUrl + '/' + req.routeOwner.username + '/presentations/'
                               + presentation._id + '/live/' + req.liveSession.id
                               + '/?role=' + role + '&view=presentation';

   if (role === 'presenter' || role === 'assistant') {
      return {
        template:  presentation.asqFilePath,
        namespace: 'ctrl',
        roleScript : '/js/asq-presenter.js'
      };
    } else if (role === 'ghost') {
      return {
        template:  presentation.asqFilePath,
        namespace: 'ghost',
        roleScript : '/js/asq-viewer.js'
      };
    } else { //viewer
      return {
        template:  presentation.asqFilePath,
        namespace: 'folo',
        roleScript : '/js/asq-viewer.js'
      };
    }

  })(role, view, presentation);

  renderOpts.commonScript = '/js/asq-common.js';

  res.render(renderOpts.template, {
    username              : req.user? req.user.username :'',
    title                 : presentation.title,
    presentationFramework : presentation.presentationFramework,
    asqApi                : config.rootUrl,
    host                  : req.app.locals.urlHost,
    port                  : req.app.locals.urlPort,
    namespace             : renderOpts.namespace,
    commonScript          : renderOpts.commonScript,
    roleScript            : renderOpts.roleScript,
    role                  : role,
    presentation          : presentation._id,
    slideTree             : JSON.stringify(presentation.slidesTree),
    presentationId        : presentation._id,
    id                    : req.liveSession.id,
    userSessionId         : req.whitelistEntry.id,
    date                  : req.liveSession.startDate,
    presentationViewUrl   : presentationViewUrl,
    presenterLiveUrl      : presenterLiveUrl
  });
}

function livePresentationFiles(req, res) {
  const presentation = req.liveSession.slides;
  const file = req.params[0];

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


/**
* Server the presentation's cockpit
*/
function liveCockpit(req, res) {
  const presentation = req.liveSession.slides;
  const rootUrl = req.app.locals.rootUrl;
  const presentationViewUrl = `${rootUrl}/${req.routeOwner.username}/presentations/
    ${presentation._id}/live/${req.liveSession.id}/?role=presernter&view=presentation`;
  const presenterLiveUrl = `${rootUrl}/${req.routeOwner.username}/live/`;


  let shouldGenerateThumbs = 'true' //string because of dust templates
  if(presentation.thumbnailsUpdated && (presentation.lastEdit - presentation.thumbnailsUpdated < 0 )){
    shouldGenerateThumbs = 'false';
  }
  
  return res.render('../public/cockpit/build/bundled/dust/asq.dust', {
    username              : req.user? req.user.username :'',
    title                 : presentation.title,
    presentationFramework : presentation.presentationFramework,
    serveDir              : 'cockpit/build/bundled/src/elements/cockpit-asq',
    asqApi                : config.rootUrl,
    host                  : req.app.locals.urlHost,
    port                  : req.app.locals.urlPort,
    namespace             : 'ctrl',
    commonScript          : '/js/asq-common.js',
    role                  : "presenter",
    presentation          : presentation._id,
    shouldGenerateThumbs  : shouldGenerateThumbs,
    slideTree             : JSON.stringify(presentation.slidesTree),
    presentationId        : presentation._id,
    id                    : req.liveSession.id,
    userSessionId         : req.whitelistEntry.id,
    date                  : req.liveSession.startDate,
    presentationViewUrl   : presentationViewUrl,
    presenterLiveUrl      : presenterLiveUrl
  });
}


const startPresentation =  coroutine(function *startPresentationGen(req, res, next) {
  try{
    logger.debug('New session from ' + req.user.username);

    const  slidesId = req.params.presentationId

    const slideshow = yield Slideshow.findOne({
      _id   : slidesId,
      owner : req.user._id })
    .exec();

    if(!slideshow){
      throw new Error('No slideshow with this id');
    }  // FIXME: create proper error like in list presentations

    slideshow.lastSession = new Date();

    //Instantiate a new session
    const newSession = new Session();
    newSession.presenter = req.user._id;
    newSession.slides = slideshow._id;
    newSession.flow = ( Session.schema.path('flow').enumValues
      .indexOf(req.body.flow) > -1 ) ? req.body.flow : 'ctrl';
    newSession.authLevel = ( Session.schema.path('authLevel').enumValues
      .indexOf(req.body.authLevel) > -1 ) ? req.body.authLevel : 'public';

    const userPromise = User
      .findById(req.user._id)
      .exec()
      .then( function onUser(user){
        if(!user){
          return Promise.reject(new Error('No user with this id'))
        } //FIXME create proper error like in list presentations
        // user.current = (newSession._id)
        // user.liveSessions.addToSet(newSession._id)
        return user.save()
      });
    const implicitQuestionData = {
      type: 'asq-text-input-q',
      author: req.user._id,
      data: {
        description: 'Implicit question placeholder for live app student questions',
        type: 'implicit-student-question',
        session: newSession._id,
      },
    };
    
    const implicitQuestion = new Question(implicitQuestionData);
    const dummyExerciseData = {
      stem: 'dummyExercise',
      questions: [implicitQuestion._id],     
    };
    const dummyExercise = new Exercise(dummyExerciseData);
    yield Promise.all([
      slideshow.save(),
      newSession.save(),
      userPromise,
      implicitQuestion.save(),
      dummyExercise.save(),
    ]);

    const pFn = Promise.promisify(presUtils.generateWhitelist[newSession.authLevel]);
    yield pFn(newSession._id, req.user);

    logger.info('Starting new ' + newSession.authLevel + ' session');
    res.location(['/', req.user.username, '/presentations/', newSession.slides,
      '/live/', newSession._id, '/?role=presenter&view=ctrl'].join(''));
    res.sendStatus(201);
  }catch(err){
    next(err)
  }
})


const terminatePresentation = coroutine(function *terminatePresentationGen(req, res, next) {

  try{
    logger.debug({
      owner_id: req.user._id,
      slideshow: req.params.presentationId
    }, 'Stopping session');


    const userId = req.user._id;
    const presentationId = req.params.presentationId;
    
    const terminatedSessions = yield Session.terminateAllSessionsForPresentation(userId, presentationId)

    // if sessions has zero length there was no live sessions
    if (! terminatedSessions.length) {
      const err404 = Error.http(404, 'No session found', {type:'invalid_request_error'});
      throw err404;
    }
    
    res.sendStatus(204);
    
    logger.log({
      owner_id: req.user._id,
      slideshow: req.params.presentationId,
      sessions: terminatedSessions.map( s => s._id.toString()),
    }, "stopped session");

  }catch(err){
    logger.error({
      err: err,
      owner_id: req.user._id,
      sessions: terminatedSessions,
    }, "error stopping session");

    //let error middleware take care of it
    next(err);
  }
});

/* Stats */
const getPresentationStats = coroutine(function *getPresentationStats(req, res, next) {
  let slideshow ;
  try{
    slideshow = yield Slideshow.findById(req.params.presentationId).exec();
  }catch(err){
    logger.error("Presentation %s not found", req.params.presentationId);
    logger.error(err.message, { err: err.stack });
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  try{
    const statsObj = yield stats.getPresentationStats(slideshow);
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

const getPresentationSettings = coroutine(function* getPresentationSettingsGen(req, res) {

  logger.debug({
    owner_id: req.user._id,
    slideshow: req.params.presentationId
  }, 'get settings of presentation');

  const user = req.user;
  const userId = user._id;
  const username = user.username;

  const slideshowId = req.params.presentationId;

  const slideshow = yield Slideshow.findById(slideshowId).exec();

  if ( ! slideshow ) {
    res.status(404);
    return res.render('404', {'msg': 'Presentation not found'});
  }

  const presentationSettings = slideshow.settings;
  const exerciseSettings = yield settings.getDustSettingsOfExercisesAll(slideshowId);

  // Whether the slideshow is currently active(running) by this user
  const sessionId = yield presUtils.getSessionIfLiveByUser(userId, slideshowId);
  const livelink  = !sessionId ? null : presUtils.getLiveLink(username, slideshowId, sessionId);

  const params = {
      host                 : req.app.locals.urlHost,
      port                 : req.app.locals.urlPort,
      namespace            : '/',
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

const downloadPresentation = coroutine(function* downloadPresentationGen(req, res, next){
  try{
    const presentation = yield presentationApi.read(req.params.presentationId);
    const presentationPath = config.uploadDir + '/' + presentation.id;

    //set the archive name
    const archiveName = filenamify(presentation.title) + '.zip';
    res.attachment(archiveName);

    const archiveStream = archive.createArchiveStream( presentationPath, presentation.asqFile, res)

    //on stream closed we can end the request
    archiveStream.on('end', function() {
      logger.log({
      },'Archive wrote %d bytes', archiveStream.pointer());
    });

    archiveStream.on('error', function(err) {
      logger.error({
        err: err,
        presentation: presentation,
      }, "creating zip archive failed");
      throw Boom.badImplementation(err.message);
    });

   archiveStream.pipe(res);
    
  }catch(err){
    console.log(err)
    next(err)
  }
})

module.exports = {
  editPresentation,
  downloadPresentation,
  liveCockpit,
  livePresentation,
  livePresentationFiles,
  startPresentation,
  terminatePresentation,
  getPresentationStats,
  getPresentationSettings,
}
