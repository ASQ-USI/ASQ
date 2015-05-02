'use strict';

var hooks = require('../hooks/hooks.js');

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
  }
}


