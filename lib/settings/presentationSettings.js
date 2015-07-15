'use strict';

var hooks = require('../hooks/hooks.js');


var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine
  , fs = require("fs");

var Exercise = db.model('Exercise');
var Slideshow = db.model('Slideshow');
var Setting = db.model('Setting');
var ObjectId = require('mongoose').Types.ObjectId;

Promise.promisifyAll(fs);


module.exports = {

  // Get settings of exercises and transform them to fit the format used in the dust template.
  getDustSettingsOfExercisesAll: coroutine(function* getDustSettingsOfExercisesAllGen(slideshowId) {
    var slideshow = yield Slideshow.findById(slideshowId).exec();
    var slides = slideshow.exercisesPerSlide;
    var exerciseSettings = [];

    var allExercises = yield Exercise.find({_id: {$in: slideshow.exercises}}).exec();
    var exerciseMap = {};
    allExercises.forEach(function(ex){
        exerciseMap[ex._id] = ex;
    });
    
    var keys = Object.getOwnPropertyNames(slides);
    for ( var key of keys ) {
      var slide = {
        index: key,
        exercises: []
      }
      var exerciseIdsPerSlides = slides[key];
      for ( var id of exerciseIdsPerSlides ) {
        var exercise = exerciseMap[id];
        slide.exercises.push({
          exerciseId: exercise._id,
          settings: yield exercise.getSettings()
        });
      }
      exerciseSettings.push(slide);
    }
    return exerciseSettings.reverse();
  }),

  createDefaultSettingsForNewPresentation: coroutine(function*createDefaultSettingsForNewPresentationGen() {
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
    var fPath = slideshow.asqFilePath;
    var html = yield fs.readFileAsync(fPath, 'utf-8');
    var r = yield hooks.doHook('update_slideshow_settings', {
      slideshow_id: slideshow_id,
      settings: settings,
      html: html
    });
    var parsedHtml = r.html;
    var exercise_ids = slideshow.exercises;
    exercise_ids = exercise_ids.map(function (s) { return ObjectId(s) });
    for ( var i in  exercise_ids ) {
      parsedHtml = yield this.updateExerciseSettingsById(parsedHtml, settings, exercise_ids[i]);
    }

    yield fs.writeFileAsync(fPath, parsedHtml);
  }),

  updateExerciseSettingsById: coroutine(function* updateExerciseSettingsByIdGen(html, settings, exercise_id) {
    var r = yield hooks.doHook('udpate_exercise_settings', {
      exercise_id: exercise_id,
      settings: settings,
      html: html,
    });
    return r.html;
  }),

  updateExerciseSettings: coroutine(function* updateExerciseSettingsGen(settings, slideshow_id, exercise_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var fPath = slideshow.asqFilePath;
    var html = yield fs.readFileAsync(fPath, 'utf-8');
    var parsedHtml = yield this.updateExerciseSettingsById(html, settings, exercise_id);
    yield fs.writeFileAsync(fPath, parsedHtml);
  })
}