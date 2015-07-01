'use strict';

var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine;

var getDustifySettingsOfExercisesAll = coroutine(function* getDustifySettingsOfExercisesAllGen(slideshow) {
  var slides = slideshow.exercisesPerSlide;
  var exerciseSettings = [];

  var max = new Setting({
    key: 'maxNumSubmissions',
    value: 0,
    kind: 'number'
  });
  yield max.save();

  var confidence = new Setting({
    key: 'confidence',
    value: true,
    kind: 'boolean'
  });
  yield confidence.save();

  
  var slides01 = {
    index: 's1',
    exercises: [{
      id: 'exercise01',
      settings: [max, confidence]
    }]
  }

  exerciseSettings.push(slides01);


  var booleanExample = new Setting({
    key: 'boolean setting',
    value: false,
    kind: 'boolean'
  });
  yield booleanExample.save();

  var selectSetting = new Setting({
    key: 'select setting',
    value: 'mid',
    kind: 'select',
    params : {
      options: ['top', 'bot', 'mid']
    }
  });
  yield selectSetting.save();

  
  var slides02 = {
    index: 's2',
    exercises: [{
      id: 'exercise02',
      settings: [booleanExample, selectSetting]
    }]
  }


  exerciseSettings.push(slides02);



  return exerciseSettings;
})

// var getDustifySettingsOfExercisesAll = coroutine(function* getDustifySettingsOfExercisesAllGen(slideshow) {
//   var slides = slideshow.exercisesPerSlide;

//   var exerciseSettings = [];

//   for (var key in slides) {
//     if (slides.hasOwnProperty(key)) {
//       var singleSlide = {
//         index: key,
//         exercises: []
//       }
//       for ( var i=0; i<slides[key].length; i++ ) {
//         var exercise = yield Exercise.findById(slides[key][i]).exec();
//         singleSlide.exercises.push({
//           id: exercise._id,
//           settings: yield exercise.getSettings()
//         });
//       }
//       exerciseSettings.push(singleSlide);
//     }
//   }
//   return exerciseSettings;
// })


module.exports = {
  getDustifySettingsOfExercisesAll: getDustifySettingsOfExercisesAll
}