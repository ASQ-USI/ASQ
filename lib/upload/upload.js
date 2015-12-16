/**
 * @module lib/upload/upload
 * @description handles uploads.
 **/

"use strict";

var adapters = require('../presentationAdapter/adapters');
var archive = require('./archive');
var parse = require('../parse/parse');
var logger = require('logger-asq');
var Promise = require("bluebird");
var coroutine = Promise.coroutine;
var fs = require("fs");
var path = require("path");
var presentationCreate = require("../presentation/presentationCreate.js");
var presentationDelete = require("../presentation/presentationDelete.js");
var fsUtils = require('../utils/fs');
var Slideshow = db.model('Slideshow');

Promise.promisifyAll(fs);

module.exports = {

  createPresentationFromZipArchive: coroutine(function *uploadHandlerGen(owner_id, name, zipPath){

    var slideshow = yield presentationCreate.createBlankSlideshow(owner_id, name);

    var presentationDir = slideshow.path;
    var extractZipArchivePromisified = Promise.promisify(archive.extractZipArchive);

    yield extractZipArchivePromisified(zipPath, presentationDir);

    // find main file
    var mainFile = yield fsUtils.getFirstHtmlFile(presentationDir);
    slideshow.originalFile = path.basename(mainFile);
    logger.debug('will use ' + mainFile + ' as original presentation file...');

    var slideShowFileHtml = yield fs.readFileAsync(mainFile, 'utf-8');

    //create asq file (we're preserving the original one)
    var fileNoExt = path.basename(slideshow.originalFile, '.html');
    slideshow.asqFile =  fileNoExt + '.asq' +'.dust';
    logger.debug('will use ' + slideshow.asqFile + ' as active presentation file...');

    yield fs.writeFileAsync(slideshow.asqFilePath, slideShowFileHtml);

    // get slides Tree
    slideshow.slidesTree = adapters.impressAsqFork.getSlidesTree(slideShowFileHtml);

    //save existing process, more things to be added in parseAndPersist
    yield slideshow.save();

    // parse microformat and persist parsed stuff to db
    yield parse.parseAndPersist(slideshow._id);

    return true;
  }),
  
  updatePresentationFromZipArchive: coroutine(function *uploadHandlerGen( slideshow_id, name, zipPath, options){
    if(options.hasOwnProperty("preserveSession") && options.preserveSession){
      yield presentationDelete.removeDbAssets(slideshow_id, ["Session"]);
    }else{
      yield presentationDelete.removeDbAssets(slideshow_id)
    }

    yield presentationDelete.removeFileAssets(slideshow_id);

    var slideshow = yield Slideshow.findById(slideshow_id).exec();

    slideshow.title = name || slideshow.title; // do not update name if undefined or null
    var presentationDir = slideshow.path;
    var extractZipArchivePromisified = Promise.promisify(archive.extractZipArchive);

    yield extractZipArchivePromisified(zipPath, presentationDir);

    // find main file
    var mainFile = yield fsUtils.getFirstHtmlFile(presentationDir);
    slideshow.originalFile = path.basename(mainFile);
    logger.debug('will use ' + mainFile + ' as original presentation file...');

    var slideShowFileHtml = yield fs.readFileAsync(mainFile, 'utf-8');

    //create asq file (we're preserving the original one)
    var fileNoExt = path.basename(slideshow.originalFile, '.html');
    slideshow.asqFile =  fileNoExt + '.asq' +'.dust';
    logger.debug('will use ' + slideshow.asqFile + ' as active presentation file...');

    yield fs.writeFileAsync(slideshow.asqFilePath, slideShowFileHtml);

    // get slides Tree
    slideshow.slidesTree = adapters.revealAsqFork.getSlidesTree(slideShowFileHtml);

    //save existing process, more things to be added in parseAndPersist
    slideshow.lastEdit = Date.now();
    yield slideshow.save();

    // parse microformat and persist parsed stuff to db
    yield parse.parseAndPersist(slideshow._id);

    return true;
  })
}
