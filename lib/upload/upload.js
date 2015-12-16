/**
 * @module lib/upload/upload
 * @description handles uploads.
 **/

"use strict";

const adapters = require('../presentationAdapter/adapters');
const archive = require('./archive');
const pdf = require('./pdf');
const parse = require('../parse/parse');
const logger = require('logger-asq');
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const fs = require("fs");
const path = require("path");
const presentationCreate = require("../presentation/presentationCreate.js");
const presentationDelete = require("../presentation/presentationDelete.js");
const fsUtils = require('../utils/fs');
const Slideshow = db.model('Slideshow');
const fileType = require('file-type');
const readChunk =  require('read-chunk');

Promise.promisifyAll(fs);

module.exports = {

  createPresentationFromFile: coroutine(function *createPresentationFromFileGen(owner_id, name, filePath){
    const chunk = yield Promise.promisify(readChunk)(filePath, 0, 262);
    const type = fileType(chunk);

    let slideshow_id;

    if(type.ext == 'zip'){
      slideshow_id = yield this.createPresentationFromZipArchive(owner_id, name, filePath);

      //remove uploaded file
      yield fs.unlinkAsync(filePath);
    }else if(type.ext == 'pdf'){
      slideshow_id = yield this.createPresentationFromPdfFile(owner_id, name, filePath);
    } 

    return slideshow_id;
  }),

  createPresentationFromPdfFile: coroutine(function *createPresentationFromPdfFileGen(owner_id, name, pdfFilePath){
    // let slideshow = yield presentationCreate.createBlankSlideshow(owner_id, name);
    // const presentationDir = slideshow.path;

    let ext = path.extname(pdfFilePath)
    if(ext !== '.pdf'){
      ext = '';
    }

    const zipPath = pdfFilePath.replace(new RegExp(ext+'$', "g"), '.zip');
    yield pdf.convertPdf2Html(pdfFilePath, zipPath)

    const slideshow_id = yield this.createPresentationFromZipArchive(owner_id, name, zipPath);

    //move source pdf to the destination dir
    let slideshow = yield Slideshow.findById(slideshow_id).exec();
    const presentationDir = slideshow.path;
    const pdfFileName = path.basename(pdfFilePath);
    const newPdfFilePath = path.resolve(presentationDir, pdfFileName );

    yield fs.renameAsync(pdfFilePath, newPdfFilePath);

    return slideshow_id;
  }),

  createPresentationFromZipArchive: coroutine(function *createPresentationFromZipArchiveGen(owner_id, name, zipPath){
    let slideshow = yield presentationCreate.createBlankSlideshow(owner_id, name);

    const presentationDir = slideshow.path;
    const extractZipArchivePromisified = Promise.promisify(archive.extractZipArchive);

    yield extractZipArchivePromisified(zipPath, presentationDir);

    yield this.findAndProcessMainFile(slideshow._id);

    return slideshow._id;
  }),
  
  updatePresentationFromZipArchive: coroutine(function *updatePresentationFromZipArchiveGen( slideshow_id, name, zipPath, options){
    if(options && options.hasOwnProperty("preserveSession") && options.preserveSession){
      yield presentationDelete.removeDbAssets(slideshow_id, ["Session"]);
    }else{
      yield presentationDelete.removeDbAssets(slideshow_id);
    }

    yield presentationDelete.removeFileAssets(slideshow_id);

    let slideshow = yield Slideshow.findById(slideshow_id).exec();

    slideshow.title = name || slideshow.title; // do not update name if undefined or null
    const presentationDir = slideshow.path;
    const extractZipArchivePromisified = Promise.promisify(archive.extractZipArchive);

    yield Promise.all([
      extractZipArchivePromisified(zipPath, presentationDir),
      slideshow.save()
      ]);

    yield this.findAndProcessMainFile(slideshow._id);

    return slideshow._id;
  }),

  findAndProcessMainFile: coroutine(function *findAndProcessMainFileGen(slideshowid){
    let slideshow = yield Slideshow.findById(slideshowid).exec();
    const presentationDir = slideshow.path;

    // find main file
    const mainFile = yield fsUtils.getFirstHtmlFile(presentationDir);
    slideshow.originalFile = path.basename(mainFile);
    logger.debug('will use ' + mainFile + ' as original presentation file...');

    const slideShowFileHtml = yield fs.readFileAsync(mainFile, 'utf-8');

    //create asq file (we're preserving the original one)
    const fileNoExt = path.basename(slideshow.originalFile, '.html');
    slideshow.asqFile =  fileNoExt + '.asq' +'.dust';
    logger.debug('will use ' + slideshow.asqFile + ' as active presentation file...');

    yield fs.writeFileAsync(slideshow.asqFilePath, slideShowFileHtml);

    // get slides Tree
    slideshow.slidesTree = adapters.revealAsqFork.getSlidesTree(slideShowFileHtml);

    //save existing process, more things to be added in parseAndPersist
    slideshow.lastEdit = Date.now();
    yield slideshow.save();

    // parse questions, stats etc. and persist parsed stuff to db
    yield parse.parseAndPersist(slideshow._id);
  })
}
