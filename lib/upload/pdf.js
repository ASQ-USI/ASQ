/**
 * @module lib/upload/pdf
 * @description generates html from pdf.
 **/

'use strict';

let config = require('../../config/');
const fs = require('fs');
const logger = require('logger-asq');
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const request = require('request');
const Slide2html = require('../../slide2html').default;

const EventEmitter = require('events');
class S2hEmitter extends EventEmitter {}


module.exports = {
  convertPdf2Html: coroutine(function *convertPdf2Html (source, destination, slideshow) {

    logger.log({
      source: source,
      destination: destination
    }, "converting PDF file into HTML");

    const s2hEmitter = new S2hEmitter();
    s2hEmitter.on('s2hProgress', (i, tot) => {

    });

    const s2hOpts = {
      file: source,
      outPath: destination,
      framework: 'impress.js'
    };

    // Saving function I'm gonna change
    const oldCLog = console.log;
    const oldCError = console.error;
    const oldPError = process.stderr.write;

    // Read and catch data from the Progress Bar
    process.stderr.write = function(data){
      if (data) {
        let match = data.match(/^Converting.*?(\d+)\/(\d+)/);
        if (match) s2hEmitter.emit('s2hProgress', slideshow.id, match[1], match[2]);
      }
    };
    // Removed to avoid weird logs
    console.log = console.error = function() {};

    const s2h = new Slide2html(s2hOpts);
    yield s2h.convert();

    // Putting original functions back
    console.log = oldCLog;
    console.error = oldCError;
    process.stderr.write = oldPError;

    s2hEmitter.emit('s2hComplete', slideshow.id);

    slideshow.isConversionDone = true;
    Promise.all([slideshow.save()]);
  })
};