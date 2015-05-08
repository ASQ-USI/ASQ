var Promise     = require("bluebird")  
  , coroutine   = Promise.coroutine
  , Slideshow   = db.model('Slideshow')
  , Exercise    = db.model('Exercise')
  , _           = require('lodash')
  

var getConf = coroutine(function* getConf(conf) {
  var slideConf = [];
  for (var key in conf) {
    if (conf.hasOwnProperty(key)) {
      // input: select
      if ( key == "slideflow" || key == "assessment") {
        var type = "select";
        var options;
        if ( key == "slideflow" ) options = slideflowTypes; 
        if ( key == "assessment" ) options = assessmentTypes;         
   
        var newOptions = [];
        for ( var i=0; i<options.length; i++ ) {
          newOptions.push({
            option   : options[i],
            selected : options[i] == conf[key]
          });
        }
       
        slideConf.push({
          id: key.toLowerCase(),
          key: key,
          type: type,
          value: null,
          options: newOptions
        })
      }
      // input: number
      if ( key == "maxNumSubmissions" ) {
        var type = "number";
        slideConf.push({
          id: key.toLowerCase(),
          key: key,
          type: type,
          value: conf[key]
        })
      }
    }
  }

  return slideConf
});


var transform = coroutine(function* transform(slides) {
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
});

module.exports = {
}