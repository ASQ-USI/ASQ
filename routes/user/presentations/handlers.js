require('when/monitor/console');
var _             = require('lodash')
, moment          = require('moment')
, nodefn          = require('when/node/function')
, path            = require('path')
, fs              = require('fs')
, when            = require('when')
, Promise         = require('bluebird')
, coroutine       = Promise.coroutine
, errorTypes      = require('../../errorTypes')
, lib             = require('../../../lib')
, dustHelpers     = lib.dustHelpers
, logger          = lib.logger.appLogger
, utils           = lib.utils.routes
, questionModel   = require('../../../models/question') //TODO fix and remove this require
//, thumbUtils      = require('./utils') //TODO Fix thumbs
, Slideshow       = db.model('Slideshow')
, Session         = db.model('Session')
, getPresentationsByCourse = require('./utils').getPresentationsByCourse
, upload = require('../../../lib/upload/upload');

Promise.promisifyAll(fs);

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
  logger.debug(req.liveSession);
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
  logger.debug('list presentations');

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
    logger.error( err.toString(), { err: err.stack });
  });
}

function updatePresentation(req, res, next) {
  logger.error('NOT IMPLEMENTED: Updating a presentation is not supported.');
  res.send(405, 'Cannot update a presentation so far...');
}


var uploadPresentation = coroutine(function *uploadPresentationGen (req, res, next){
  try{
    var owner_id = req.user._id
      , name = req.files.upload.name
      , zipPath = req.files.upload.path;

    var slideshow = yield upload.createPresentationFromZipArchive( owner_id, name, zipPath);

    //remove zip file
    yield fs.unlinkAsync(zipPath);

    logger.log({
      owner_id: req.user._id,
      slideshow: slideshow._id,
      file_path: path,
      file_name: name
    }, "uploaded presentation");

    res.redirect(303, ['/', req.user.username, '/presentations/?alert=',
      slideshow.title, ' uploaded successfully!&type=success']
      .join(''));

  }catch(err){
    console.dir(err.stack)
    logger.error({
      err: err,
      owner_id: req.user._id,
      file_path: zipPath,
      file_name: name
    }, "error uploading presentation");
  }
});


module.exports = {
  deletePresentation   : deletePresentation,
  getPresentation      : getPresentation,
  getPresentationFiles : getPresentationFiles,
  listPresentations    : listPresentations,
  updatePresentation   : updatePresentation,
  uploadPresentation   : uploadPresentation
}
