'use strict';

var hooks = require('../hooks/hooks.js');

var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine
  , fs = require("fs");

var Exercise = db.model('Exercise');
var Slideshow = db.model('Slideshow');
var Setting = db.model('Setting');

Promise.promisifyAll(fs);


module.exports = {

    // TODO: need this?
    getDustifySettingsOfExercisesAll: coroutine(function* getDustifySettingsOfExercisesAll(slideshow) {
    var slides = slideshow.exercisesPerSlide;

    var exerciseSettings = [];

    for (var key in slides) {
      if (slides.hasOwnProperty(key)) {
        var singleSlide = {
          index: key,
          exercises: []
        }
        for ( var i=0; i<slides[key].length; i++ ) {
          var exercise = yield Exercise.findById(slides[key][i]).exec();
          singleSlide.exercises.push({
            exerciseId: exercise._id,
            settings: yield exercise.getSettings()
          });
        }
        exerciseSettings.push(singleSlide);
      }
    }
    return exerciseSettings;
  }),

  getDefaultSettingsForNewPresentation: coroutine(function*getDefaultSettingsForNewPresentationGen() {
    var settingsArray = [
      {
        key: 'maxNumSubmissions',
        value: 0,
        kind: 'number',
      },
      {
        key: 'slideflow',
        value: 'follow',
        kind: 'select',
        params: {
          options: ['self', 'follow', 'ghost']
        }, 
      },
      {
        key: 'assessment',
        value: 'self',
        kind: 'select',
        params: {
          options: ['peer', 'auto', 'self']
        }, 
      },
      {
        key: 'example',
        value: 2,
        kind: 'range',
        params: {
          min: 1,
          max: 5,
          step: 1
        }
      },
      {
        key: 'boolean',
        value: false,
        kind: 'boolean',
      }
    ];

    return yield Setting.create(settingsArray);
  }),

  updateSlideshowSettings: coroutine(function* updateSlideshowSettingsGen(settings, slideshow_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var destination = app.get('uploadDir') + '/' + slideshow_id;  
    var fPath = destination + '/' +  slideshow.asqFile;
    var html = yield fs.readFileAsync(fPath, 'utf-8');

    var r = yield hooks.doHook('update_slideshow_settings', {
      slideshow_id: slideshow_id,
      settings: settings,
      html: html
    });

    var parsedHtml = r.html;

    //TODO: update exercises' settings


    yield fs.writeFileAsync(fPath, parsedHtml);
    
    return true;
  }),

  updateExerciseSettings: coroutine(function* updateExerciseSettingsGen(conf, slideshowId, exerciseId) {
    var slideshow = yield Slideshow.findById(slideshowId).exec();
    var exercise = yield Exercise.findById(exerciseId).exec();
    var destination = app.get('uploadDir') + '/' + slideshowId;  
    var fPath = destination + '/' +  slideshow.asqFile;
    var slideShowFileHtml = yield fs.readFileAsync(fPath, 'utf-8');

    var parsedHtml = yield hooks.doHook('udpate_exercise_settings', {
      settings: conf,
      html: slideShowFileHtml,
      exercise: exercise
    });

    yield fs.writeFileAsync(fPath, parsedHtml);
    
    return true;
  })
}