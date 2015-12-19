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

module.exports = {
  convertPdf2Html: function (source, destination) {

    return new Promise(function (resolve, reject) {

      logger.log({
        source: source,
        destination: destination
      }, "generating zipped HTML from PDF file");

      let file = fs.createWriteStream(destination);

      let formData = {
       file: fs.createReadStream(source)
      };

      let r = request.post({
        url: config.pdfServer.url,
        formData: formData
      }).on('error',  function (error) {
        logger.error({
          err: error,
          source: source,
          destination: destination
        }, "error generating zipped HTML from PDF file");
         reject(error);
       }).on('end',  function (res) {
         resolve(true);
       }).on('response',  function (res) {
          res.pipe(file);
       })
    });
  }
}