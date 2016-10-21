/** @module lib/courses/listPresentations
    @description functions to help with listing presentation in courses
*/
'use strict';

var cheerio    = require('cheerio');
var fs         = require('fs');
var moment     = require('moment');
var config     = require('../../config');
var logger     = require('logger-asq');
var Promise    = require("bluebird");
var coroutine  = Promise.coroutine;

var getConverstionMsg = function getConverstionMsg (slideshowStatus) {
  let dictionary = {
    "not_started": 'Conversion is not started yet',
    "converting_pdf_to_html": 'Conversion in progress',
    "injiecting_questions": 'Injiecting questions'
  };
  return dictionary[slideshowStatus];
};

module.exports = {
  getPresentationsByCourse : coroutine(function *getPresentationsByCourseGen(userId, Session, Slideshow) {
    logger.debug('getPresentationsByCourse');
    var slidesByCourse = null; //to evaluate as false in dustjs
    try{
      var sessionPromise = Session.getLiveSessions(userId);
      var slideshowPromise = Slideshow.find({
        owner : userId
      }, '_id title course lastSession lastEdit thumbnails fontFaces pdfFile conversionStatus').exec();

      var results = yield Promise.all([sessionPromise, slideshowPromise])
      var sessions =  results[0];
      var slides = results[1];
      var live = {};
      sessions.forEach(function(session){
        live[session.slides.toString()]=session._id;
      });

      if (typeof slides != "undefined"
            && slides != null
            && slides.length > 0) {
        slidesByCourse = {};
        for (var i = 0; i < slides.length; i++) {
          var slideshow = slides[i].toJSON();
          if (live.hasOwnProperty(slideshow._id)) {
            slideshow.live = live[slideshow._id]
          }else{
            slideshow.live = null;
          }

          if (!slidesByCourse.hasOwnProperty(slideshow.course)) {
            slidesByCourse[slideshow.course] = [];
          }
          slideshow.lastEdit = moment( slideshow.lastEdit)
              .format('DD.MM.YYYY HH:mm');

          if( slideshow.lastSession){
            slideshow.lastSession = moment( slideshow.lastSession)
                .format('DD.MM.YYYY HH:mm');
          }

          slideshow.isConverting = !(!slideshow.pdfFile || 0 === slideshow.pdfFile.length) && (slideshow.conversionStatus !== 'done');

          slideshow.conversionMessage = getConverstionMsg(slideshow.conversionStatus);

          delete slideshow.pdfFile;
          delete slideshow.conversionStatus;

          slidesByCourse[slideshow.course].push(slideshow);
        }
      }
    }catch(err){
      logger.error( err.toString(), { err: err.stack });
    }
    return slidesByCourse;
  })
}