/** @module lib/courses/listPresentations
    @description functions to help with listing presentation in courses
*/
'use strict';

var cheerio    = require('cheerio');
var fs         = require('fs');
var mkdirp     = require('mkdirp');
var moment     = require('moment');
var config     = require('../../config');
var appLogger  = require('../logger').appLogger;
var Promise    = require("bluebird");
var coroutine  = Promise.coroutine;


module.exports = {
  getPresentationsByCourse : coroutine(function *getPresentationsByCourseGen(userId, Session, Slideshow) {
    appLogger.debug('getPresentationsByCourse');
    var slidesByCourse = null; //to evaluate as false in dustjs
    try{
      var sessionPromise = Session.getLiveSessions(userId);
      var slideshowPromise = Slideshow.find({
        owner : userId
      }, '_id title course lastSession lastEdit thumbnails fontFaces').exec();

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
          slidesByCourse[slideshow.course].push(slideshow);
        }
      }
    }catch(err){
      appLogger.error( err.toString(), { err: err.stack });
    }
    return slidesByCourse;
  })
}