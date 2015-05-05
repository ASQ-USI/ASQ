'use strict';

var hooks = require('../hooks/hooks.js');

var fs = require("fs")
  , path = require("path")
  , dust   = require('dustjs-linkedin')
  , Promise = require("bluebird")  
  , coroutine = Promise.coroutine
  , Slideshow = db.model('Slideshow')
  , Question = db.model('Question')
  , Exercise = db.model('Exercise');

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
    var destination = app.get('uploadDir') + '/' + slideshow_id;  
    var fPath = destination + '/' +  slideshow.asqFile;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');


    var parsedHtml = yield hooks.doHook('update_slideshow_configuration', {
      slideshow_id: slideshow_id,
      html: slideShowFileHtml,
      slideshow: slideshow,
      conf: conf
    });

    var exConf = {
      maxNumSubmissions: conf.maxNumSubmissions
    }
    parsedHtml = yield hooks.doHook('udpate_exercise_configuration', {
      conf: exConf,
      html: parsedHtml
    });

    yield fs.writeFileAsync(fPath, parsedHtml);
    
    return true;
  })
}


