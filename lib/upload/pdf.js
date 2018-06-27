/**
 * @module lib/upload/pdf
 * @description generates html from pdf.
 **/

'use strict';

const logger = require('logger-asq');
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const fs = require('fs-extra');
const path = require('path');
const cheerio = require('cheerio');
const fsUtils = require('../utils/fs.js');
const Slide2html = require('../../slide2html').default;
const socketEmitter = require('../../lib/socket/pubsub');
const Slideshow = db.model('Slideshow');

module.exports = {

  injectPdfBoilerplateMarkup:function(html){
    var $ = cheerio.load(html,  {
      decodeEntities: false,
      lowerCaseAttributeNames:false,
      lowerCaseTags:false,
      recognizeSelfClosing: true
    });

    $('head')
      .append('<script src="bower_components/webcomponentsjs/webcomponents-lite.min.js"></script>')
      .append('<link rel="import" href="bower_components/asq-elements/asq-elements.html" />')
      .append('<link rel="import" href="shared-styles.html">')
      .append('<style is="custom-style" include="shared-styles"></style>');
    return $.root().html();
  },

  addPdfBoilerplateFiles: function (slideshow) {
    const fileList = [
      'shared-styles.html',
      'bower.json',
      '.bowerrc',
      'bower_components'
    ];
    return Promise.map(fileList, file => {
      const src = path.resolve(__dirname, '../support/pdf/', file)
      const dest = path.resolve( slideshow.path, file)
      fs.copy(src, dest)
    });
  },

  convertPdf2Html: coroutine(function *convertPdf2HtmlGen (source, destination, slideshow_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();

    slideshow.conversionStatus = 'converting_pdf_to_html';
    yield slideshow.save();

    logger.log({
      source: source,
      destination: destination
    }, 'converting PDF file into HTML');

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

    yield this.addPdfBoilerplateFiles(slideshow);
    const mainFile = yield fsUtils.getFirstHtmlFile(slideshow.path);
    const html = yield fs.readFile( mainFile,'utf-8');
    const htmlAfterInjection = this.injectPdfBoilerplateMarkup(html);
    yield fs.writeFile( mainFile, htmlAfterInjection);
  })
};