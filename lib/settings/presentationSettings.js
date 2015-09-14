'use strict';

var hooks = require('../hooks/hooks.js');


var Promise     = require("bluebird");  
var coroutine   = Promise.coroutine;
var fs          = require("fs");


var Exercise    = db.model('Exercise');
var Slideshow   = db.model('Slideshow');
var ObjectId    = require('mongoose').Types.ObjectId;


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
          settings: exercise.settings
        });
      }
      exerciseSettings.push(slide);
    }
    return exerciseSettings.reverse();
  }),

  
  updateSlideshowSettings: coroutine(function* updateSlideshowSettingsGen(settings, slideshow_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var fPath = slideshow.asqFilePath;
    var html = yield fs.readFileAsync(fPath, 'utf-8');
    var r = yield hooks.doHook('update_slideshow_settings', {
      slideshow_id: slideshow_id,
      settings: settings,
      html: html,
      status: 'unknown'
    });

    if ( r.status !== 'success' ) Promise.reject(new Error('Field to update presentation level settings.')); 
    var parsedHtml = r.html;
    var exercise_ids = slideshow.exercises;
    exercise_ids = exercise_ids.map(function (s) { return ObjectId(s) });
    
    for ( var i in  exercise_ids ) {
      var rr = yield this.updateExerciseSettingsById(parsedHtml, settings, exercise_ids[i]);
      parsedHtml = rr.html;
    }

    yield fs.writeFileAsync(fPath, parsedHtml);

  }),

  updateExerciseSettingsById: coroutine(function* updateExerciseSettingsByIdGen(html, settings, exercise_id) {
    var r = yield hooks.doHook('udpate_exercise_settings', {
      exercise_id: exercise_id,
      settings: settings,
      html: html,
      status: 'unknown'
    });
    return r;
  }),

  updateExerciseSettings: coroutine(function* updateExerciseSettingsGen(settings, slideshow_id, exercise_id) {
    var slideshow = yield Slideshow.findById(slideshow_id).exec();
    var fPath = slideshow.asqFilePath;
    var html = yield fs.readFileAsync(fPath, 'utf-8');
    var r = yield this.updateExerciseSettingsById(html, settings, exercise_id);
    if ( ! r.status ) Promise.reject(new Error('Field to update exercise level settings.')); 
    yield fs.writeFileAsync(fPath, r.html);
  })
}