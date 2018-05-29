'use strict';

const _ = require('lodash');
const moment = require('moment');
const validator = require('validator');
const path = require('path');
const fs  = require('fs');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const errorTypes = require('../../../errors/errorTypes');
const lib = require('../../../lib');
const dustHelpers = lib.dustHelpers;
const logger = require('logger-asq');
const utils = lib.utils.routes;
const questionModel = require('../../../models/question'); //TODO fix and remove this require
const Slideshow = db.model('Slideshow');
const Session = db.model('Session');
const getPresentationsByCourse = require('../../../lib/courses/listPresentations').getPresentationsByCourse;
const upload = require('../../../lib/upload/upload');
const now = require('../../../lib/now/now');
const cons = require('consolidate');

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
      if (slideshow) return slideshow.remove()
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
       cookie          : decodeURIComponent(req.headers.cookie),
       slidesByCourses : slidesByCourse,
       JSONIter        : dustHelpers.JSONIter,
       host            : res.app.locals.urlHost,
       port            : res.app.locals.urlPort,
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

var putPresentation = coroutine(function *putPresentationGen(req, res, next) {

  try{
    let owner_id = req.user._id
    var name = req.body.title //if name is null of undefined it won't be updated
    let presentationFramework = req.body.presentationFramework; //if presentationFramework is null of undefined it won't be updated
    var zipPath = req.files.upload.path;

    let slideshow = yield Slideshow.findById(req.params.presentationId).exec();

    if(! slideshow){
      //treat it as new upload
      return next();
    }

    // TODO: handle this better
    if(slideshow.owner.toString() !== owner_id.toString() ){
      next(new Error("You are not the owner of this presentation"))
    }

    var options = {
      preserveSession: req.query.preserveSession
    }

    const slideshowid = yield upload.updatePresentationFromZipArchive(
      slideshow._id, name, presentationFramework, zipPath, options);
    slideshow = yield Slideshow.findById(slideshowid).lean().exec();

    //remove zip file
    yield fs.unlinkAsync(zipPath);

    // HACK: empty dust cache
    // if multiple servers are used then the rest of the servers WILL NOT
    // get notified :-(
    // TODO: should only delete the updated presentation path
    cons.clearCache()

    logger.log({
      owner_id: req.user._id,
      slideshow: slideshow._id,
      file_path: zipPath,
      file_name: name
    }, "updated presentation from zip");

    res.redirect(303, ['/', req.user.username, '/presentations/?alert=',
      slideshow.title, ' updated successfully!&type=success']
      .join(''));

  }catch(err){
    console.log(err.stack);

    logger.error({
      err: err,
      owner_id: req.user._id,
      file_path: zipPath,
      file_name: name
    }, "error updating presentation from zip");
  }
});

var createPresentation = function (req, res, next){
  //if req.files.upload, user is uploading a presentation
  //if req.body.now, user is publishing a now quiz
  if(req.files.upload) {
    uploadPresentation(req, res, next);
  } else if(req.body.now) {
    createNowPresentation(req, res, next);
  } else {
    console.log("ERROR: Presentation is neither being created by a now quiz or an upload.")
  }
};

var uploadPresentation = async function (req, res, next){
  try{
    let owner_id = req.user._id;
    let presentationFramework = req.body.presentationFramework;
    var name = req.body.title || req.files.upload.name;
    var uploadFilePath = req.files.upload.path;

    const slideshowid = await upload.createPresentationFromFile( owner_id, name, presentationFramework, uploadFilePath);
    const slideshow = await Slideshow.findById(slideshowid).lean().exec();

    logger.log({
      owner_id: req.user._id,
      slideshow: slideshow._id,
      file_path: uploadFilePath,
      file_name: name
    }, "uploaded presentation");

    res.redirect(303, ['/', req.user.username, '/presentations/?alert=',
      slideshow.title, ' uploaded successfully!&type=success']
      .join(''));

  }catch(err){
    console.log(err.stack);

    logger.error({
      err: err,
      owner_id: req.user._id,
      file_path: uploadFilePath,
      file_name: name
    }, "error uploading presentation");
  }
}

var createNowPresentation = async function(req, res) {

  // exercise coming from qea-editor: req.body.exercise

  try {
    let owner_id = req.user._id;
    let exercise = req.body.exercise;
    const slideshowid = await now.createPresentationFromSingleExerciseHtml(owner_id, 'nowquiz', exercise);
    const slideshow = Slideshow.findById(slideshowid).lean().exec();

    logger.log({
      owner_id: req.user._id,
      slideshow: slideshow._id,
      exercise: exercise
    }, "uploaded new now quiz");

    res.json({ status: 'success', redirect: `/${req.user.username}/presentations/` });

  } catch(err){
    console.log(err.stack);
    logger.error({
      err: err,
      owner_id: req.user._id,
      exercise: exercise
    }, "error uploading now quiz");
  }
}

function validatePutParams(req, res, next){
  var ps = req.query.preserveSession
  //if user has specified preserveSession it should either be true or false
  if (validator.isNull(ps)){
    ps = false;
  }else {
    ps = ps.trim()
    if (! validator.matches(ps, /^(true|false)$/ )){
      next(new Error('Invalid urlparam error. Parameter `preserveSession` should be either `true` or `false`'))
    }
  }
  //force Boolean
  req.query.preserveSession = !!ps;
  next();
}

module.exports = {
  deletePresentation   : deletePresentation,
  getPresentation      : getPresentation,
  getPresentationFiles : getPresentationFiles,
  listPresentations    : listPresentations,
  putPresentation      : putPresentation,
  createPresentation   : createPresentation,
  createNowPresentation   : createNowPresentation,
  uploadPresentation   : uploadPresentation,
  validatePutParams    : validatePutParams
}
