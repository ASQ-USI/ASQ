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
var Slideshow = db.model('Slideshow');
const socketEmitter = require('../../lib/socket/pubsub');

module.exports = {
  convertPdf2Html: coroutine(function *convertPdf2Html (source, destination, slideshow_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();

    slideshow.conversionStatus = 'converting_pdf_to_html';
    yield slideshow.save();

    logger.log({
      source: source,
      destination: destination
    }, "converting PDF file into HTML");

    const s2hOpts = {
      file: source,
      outPath: destination,
      framework: 'impress.js'
    };

    const s2h = new Slide2html(s2hOpts);

    s2h.on('progress', function(data){
      if (data) {
        socketEmitter.emit('presentation_conversion_progress', {
          type: 's2h_progress',
          data: {
            owner_id: slideshow.owner.toString(),
            slideshow_id: slideshow.id,
            current_slide: data.count,
            total_slides: data.total
          }
        });
      }
    });

    yield s2h.convert();

  })
};