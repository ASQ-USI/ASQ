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
const socketEmitter = require('../../lib/socket/pubsub');

module.exports = {
  convertPdf2Html: coroutine(function *convertPdf2Html (source, destination, owner_id, slideshow) {

    logger.log({
      source: source,
      destination: destination
    }, "converting PDF file into HTML");

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
        if (match) socketEmitter.emit('presentation_conversion_progress', {
                                                                  type: 's2h_progress',
                                                                  data: {
                                                                    owner_id: owner_id,
                                                                    slideshow_id: slideshow.id,
                                                                    current_slide: match[1],
                                                                    total_slides: match[2]
                                                                  }
                                                                  });
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

    socketEmitter.emit('presentation_conversion_progress',{
      type: 's2h_complete',
      data: {
        owner_id: owner_id,
        slideshow_id: slideshow.id
      }
    });

    slideshow.isConversionDone = true;
    Promise.all([slideshow.save()]);

  })
};