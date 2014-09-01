var cheerio    = require('cheerio')
  , pfs        = require('promised-io/fs')
  , lib        = require('../../../../lib')
  , appLogger  = lib.logger.appLogger
  , presUtils  = lib.utils.presentation
  , config     = require('../../../../config')
  , when       = require('when')
  , nodefn     = require('when/node/function')
  , Slideshow  = db.model('Slideshow')
  , User = db.model('User', schemas.userSchema)
  , Session = db.model('Session');


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
  appLogger.debug(req.query.role);
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
    , presenterLiveUrl    = '';

  //TMP until roles are defined more precisely
  appLogger.debug('Select template for ' + role + ' ' + view);
  var renderOpts = (function getTemplate(role, view, presentation) {
      if (view === 'ctrl' && role !== 'viewer') {

        presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          template: 'presenterControl',
          mode: 'ctrl', //change to role
        };
      } else if (role === 'presenter' || role === 'assistant') {
        presentationViewUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/presentations/'
                            + presentation._id + '/live/' + req.liveSession.id
                            + '/?role=' + role+ '&view=presentation';

        presenterLiveUrl = ASQ.rootUrl + '/' + req.routeOwner.username + '/live/';
        return {
          template: presentation.presenterFile,
          mode: 'ctrl',
        };
      }
      return {
          template: presentation.viewerFile,
          mode: 'folo',
        };
  })(role, view, presentation);

  appLogger.debug('Selected template: ' + renderOpts.template);
  res.render(renderOpts.template, {
    //username            : req.user.username, //needed for ctrl but not necessary present as this might be public (guest users)
    username            : req.user.username,
    title               : presentation.title,
    host                : ASQ.host,
    port                : ASQ.port,
    mode                : renderOpts.mode,
    presentation        : presentation._id,
    id                  : req.liveSession.id,
    date                : req.liveSession.startDate,
    presentationViewUrl : presentationViewUrl,
    presenterLiveUrl    : presenterLiveUrl
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
    res.sendfile(presentation.path + file);
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
      newSession.authLevel = ( Session.schema.path('authLevel').enumValues
        .indexOf(req.query.al) > -1 ) ? req.query.al : 'public';
      //update liveSessions of user
      var userPromise = User.findById(req.user._id).exec()
      .then(
        function onUser(user){
          if(!user){
            return when.reject(new Error('No user with this id'))
          } //FIXME create proper error like in list presentations
          // user.current = (newSession._id)
          // user.liveSessions.addToSet(newSession._id)
          return nodefn.call(user.save.bind(user))
        }
      );

      return when.all([
        nodefn.call(slideshow.save.bind(slideshow)),
        nodefn.call(newSession.save.bind(newSession)),
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
      res.send(201);
    },
    function errorHandler(err){
      next(err)
    }
  );
}

function stopPresentation(req, res, next) {
  appLogger.debug('Stoping session from ' + req.user.username);

  Session.find({
    presenter: req.user._id,
    slides: req.params.presentationId,
    endDate: null
  }).exec()
  .then(function(sessions){
    return when.map(sessions, function(session){
      session.endDate = Date.now();
      return nodefn.lift(session.save.bind(session))();
    })
  }).then(
    function onStopped(){
      appLogger.info('Session stopped');

       //JSON
    if(req.accepts('application/json')){
      res.json({
        "presentationId": req.params.presentationId,
        "stopped": true
      });
      return;
    }
    //HTML
      res.send(204);
    },
    function onError(err){
      next(err)
    }
  );
}

module.exports = {
  editPresentation      : editPresentation,
  livePresentation      : livePresentation,
  livePresentationFiles : livePresentationFiles,
  startPresentation     : startPresentation,
  stopPresentation      : stopPresentation
}