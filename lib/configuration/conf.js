'use strict';

var fs = require("fs");
var dust = require('dustjs-linkedin');
var Promise = require("bluebird");
var coroutine = Promise.coroutine;
var Slideshow = db.model('Slideshow');
var Question = db.model('Question');
var Exercise = db.model('Exercise');
var hooks = require('../hooks/hooks.js');

Promise.promisifyAll(fs);


module.exports = {
  createExerciseConfiguration: function(option){
    return hooks.doHook('create_exercise_configuration', option).then(function(option){
      return Promise.resolve(option);
    });
  },

  createSlidesConfiguration: function(option){
    return hooks.doHook('create_slideshow_configuration', option).then(function(option){
      return Promise.resolve(true);
    });
  },

  updateSlideshowConf: coroutine(function* updateSlideshowConfGen(conf, slideshow_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var slideShowFileHtml = yield fs.readFileAsync(slideshow.asqFilePath, 'utf-8');

    // TODO: change hook's name to settings
    var parsedHtml = yield hooks.doHook('update_slideshow_configuration', {
      slideshow_id: slideshow_id,
      html: slideShowFileHtml,
      slideshow: slideshow,
      conf: conf
    });

    //TODO: update exercises' settings
    // var exConf = {
    //   maxNumSubmissions: conf.maxNumSubmissions
    // }
    // parsedHtml = yield hooks.doHook('udpate_all_exercise_configuration', {
    //   conf: exConf,
    //   html: parsedHtml
    // });

    yield fs.writeFileAsync(slideshow.asqFilePath, parsedHtml);
    
    return true;
  }),

  updateExerciseConf: coroutine(function* updateExerciseConfGen(slideshowId, exerciseId, conf) {
    var slideshow = yield Slideshow.findById(slideshowId).exec();
    var slideShowFileHtml = yield fs.readFileAsync(slideshow.asqFilePath, 'utf-8');

    var parsedHtml = yield hooks.doHook('udpate_exercise_conf', {
      conf: conf,
      html: slideShowFileHtml,
      exerciseId: exerciseId
    });

    yield fs.writeFileAsync(slideshow.asqFilePath, parsedHtml);
    
    return true;
  })
}


