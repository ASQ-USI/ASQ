'use strict';

var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine;

var Exercise = db.model('Exercise');


// TODO: need this?
var getDustifySettingsOfExercisesAll = coroutine(function* getDustifySettingsOfExercisesAll(slideshow) {
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
})


module.exports = {
  getDustifySettingsOfExercisesAll: getDustifySettingsOfExercisesAll
}