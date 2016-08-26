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

module.exports = {
  convertPdf2Html: coroutine(function *convertPdf2Html (source, destination, slideshow_id) {

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
    return s2h.convert();
  })
};