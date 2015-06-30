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
    settings[i].type = inputUIMap[settings[i].type];
  }

  return settings;
})


// var getDustifySettings = coroutine(function* getDustifySettingsGen(slideshow) {
//   var prstSettings = slideshow.configuration;
//   var settings = [];
//   for (var key in prstSettings) {
//     if (prstSettings.hasOwnProperty(key)) {
//       // input: select
//       if ( key == "slideflow" || key == "assessment") {
//         var type = "select";
//         var options;
//         if ( key == "slideflow" ) options = slideflowTypes; 
//         if ( key == "assessment" ) options = assessmentTypes;         
   
//         var newOptions = [];
//         for ( var i=0; i<options.length; i++ ) {
//           newOptions.push({
//             option   : options[i],
//             selected : options[i] == prstSettings[key]
//           });
//         }
       
//         settings.push({
//           id: key.toLowerCase(),
//           key: key,
//           type: type,
//           value: null,
//           options: newOptions
//         })
//       }
//       // input: number
//       if ( key == "maxNumSubmissions" ) {
//         var type = "number";
//         settings.push({
//           id: key.toLowerCase(),
//           key: key,
//           type: type,
//           value: prstSettings[key]
//         })
//       }
//     }
//   }
//   return settings
// })

var getDustifySettingsOfExercise = coroutine(function* getDustifySettingsOfAllExercisesGen() {

})

var getDustifySettingsOfAllExercises = coroutine(function* getDustifySettingsOfAllExercisesGen(slideshow) {
  var slides = slideshow.exercisesPerSlide;
  var data = [];
  for (var key in slides) {
    if (slides.hasOwnProperty(key)) {
      var slide = {
        index: key,
        exercises: []
      };
      
      for ( var i=0; i<slides[key].length; i++ ) {
        var exObject = yield Exercise.findById(slides[key][i]).exec();
        var exercise = {};
        exercise.uid = slides[key][i]; 
        exercise.names = ['maxNumSubmissions', 'confidence'];
        exercise.maxNumSubmissions = exObject.maxNumSubmissions;
        exercise.confidence = exObject.confidence;
        slide.exercises.push(exercise);
      }
      data.push(slide)
    }
  }
  return data.reverse();
})

module.exports = {
  getDustifySettings: getDustifySettings,
  getDustifySettingsOfAllExercises: getDustifySettingsOfAllExercises
}