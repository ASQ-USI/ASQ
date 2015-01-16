/**
 * @module lib/upload/upload
 * @description handles uploads.
 **/

"use strict";

var adapters = require('../presentationAdapter/adapters')
  , archive = require('./archive')
  , parse = require('../parse/parse')
  , logger = require('../logger').appLogger
  , Promise = require("bluebird")
  , coroutine = Promise.coroutine
  , fs = require("fs")
  , path = require("path")
  , presentationCreate = require("../presentation/presentationCreate.js")
  , fsUtils = require('../utils/fs');

Promise.promisifyAll(fs);

module.exports = {

  createPresentationFromZipArchive: coroutine(function *uploadHandlerGen(owner_id, name, zipPath){
    var slideshow = yield presentationCreate.createBlankSlideshow(owner_id, name);

    var destination = app.get('uploadDir') + '/' + slideshow._id
      , extractZipArchivePromisified = Promise.promisify(archive.extractZipArchive);

    yield extractZipArchivePromisified(zipPath, destination);

    // find main file
    var mainFile = yield fsUtils.getFirstHtmlFile(destination);
    slideshow.originalFile = path.basename(mainFile);
    logger.debug('will use ' + mainFile + ' as main presentation file...');

    var slideShowFileHtml = yield fs.readFileAsync(mainFile, 'utf-8');

    // Escape (javascript) brackets otherwise dust will try to parse them
    slideShowFileHtml = parse.escapeDustBrackets(slideShowFileHtml.toString());

    // save file
    var fPath = destination + '/' +  slideshow.originalFile;
    yield fs.writeFileAsync(fPath, slideShowFileHtml);

    // get slides Tree
    slideshow.slidesTree = adapters.impressAsqFork.getSlidesTree(slideShowFileHtml);

    //save existing process, more things to be added in parseAndPersist
    yield slideshow.saveWithPromise();

    // parse microformat and persist parsed stuff to db
    yield parse.parseAndPersist(slideshow._id);

    return true;
  })
}
