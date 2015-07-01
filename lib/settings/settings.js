'use strict';

var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine;

var presentationUtils = require('../utils/presentation')
  , utils = require('./utils')
  , assessmentTypes = require('../../models/assessmentTypes')
  , slideflowTypes = require('../../models/slideflowTypes')
  
var Slideshow = db.model('Slideshow')
  , Exercise  = db.model('Exercise')


var types = [ 'String',
              'Number',
              'Date',
              'Boolean',
              'Enum' ];

var inputUIMap = {
  'String': 'text',
  'Number' : 'number',
  'Date' : 'date',
  'Boolean' : 'checkbox',
  'Enum' : 'select'
}


var getDustifySettings = coroutine(function* getDustifySettingsGen(slideshow) {
  var settings = yield slideshow.getSettings();

  for ( var i=0; i<settings.length; i++ ) {
    settings[i].kind = inputUIMap[settings[i].kind];
  }

  return settings;
})

var getDustifySettingsOfExercise = coroutine(function* getDustifySettingsOfAllExercisesGen() {

})

var getDustifySettingsOfExercisesAll = coroutine(function* getDustifySettingsOfExercisesAllGen(slideshow) {
  var slides = slideshow.exercisesPerSlide;
  var exerciseSettings = [];

  var max = new Setting({
    key: 'maxNumSubmissions',
    value: 0,
    kind: 'Number'
  });
  yield max.save();

  var confidence = new Setting({
    key: 'confidence',
    value: true,
    kind: 'Boolean'
  });
  yield confidence.save();

  
  var slides01 = {
    index: '12312321',
    exercises: [{
      id: 'exercise01',
      settings: [max, confidence]
    }]
  }
  for ( var i=0; i<slides01.exercises[0].settings.length; i++ ) {
    slides01.exercises[0].settings[i].type = inputUIMap[slides01.exercises[0].settings[i].type];
  }
  exerciseSettings.push(slides01);


  var max2 = new Setting({
    key: 'maxNumSubmissions',
    value: 2,
    kind: 'Number'
  });
  yield max2.save();

  var confidence2 = new Setting({
    key: 'confidence',
    value: false,
    kind: 'Boolean'
  });
  yield confidence2.save();

  
  var slides02 = {
    index: '222222222',
    exercises: [{
      id: 'exercise02',
      settings: [max2, confidence2]
    }]
  }

  for ( var i=0; i<slides02.exercises[0].settings.length; i++ ) {
    slides02.exercises[0].settings[i].type = inputUIMap[slides02.exercises[0].settings[i].type];
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
  getDustifySettings: getDustifySettings,
  getDustifySettingsOfExercisesAll: getDustifySettingsOfExercisesAll
}