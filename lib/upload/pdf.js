/**
 * @module lib/upload/pdf
 * @description generates html from pdf.
 **/


const slide2html = function(opts, cb){
  process.nextTick(() => cb());
}

const Promise = require("bluebird");
const coroutine = Promise.coroutine;

module.exports = {
  convertPdf2Html: function(source, destination, cb) {

    logger.log({
      source: source,
      destination: destination
    }, "generating html from pdf file");

    slide2html({
      source: source,
      ouput: destination
    }, cb)
  }
}