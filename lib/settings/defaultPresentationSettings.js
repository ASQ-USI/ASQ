'use strict';


var _ = require("lodash");

var defaultSettings = null;

var parseDefaultSettings = function() {
  var defaults = require('../../data/defaultPresentationSettings.json');
  
  defaultSettings = {};
  defaults.forEach(function(setting, index){
    setting.levels.forEach(function(level, index){
      if ( !defaultSettings.hasOwnProperty(level) ) {
        defaultSettings[level] = [];
      } 
      setting = _.clone(setting, true);
      delete setting.levels;
      setting.level = '';
      defaultSettings[level].push(setting);
    });
  });

  return defaultSettings;
}


var getDefaultSettingsOfLevel = function(level, format) {
  if ( ! defaultSettings ) {
    defaultSettings = parseDefaultSettings();
  }

  var settingsArray = _.clone(defaultSettings[level], true);

  for ( var i in settingsArray ) {
    settingsArray[i].level = level;
  }

  if ( format === 'object' ) {
    var settingsObject = {};
    settingsArray.forEach(function(setting) {
      settingsObject[setting.key] = _.clone(setting, true);
    });
    return settingsObject;
  }

  return settingsArray;
}

module.exports = {
  presentation: getDefaultSettingsOfLevel('presentation'),
  exercise: getDefaultSettingsOfLevel('exercise'),
  question: getDefaultSettingsOfLevel('question'),

  presentationObject: getDefaultSettingsOfLevel('presentation', 'object'),
  exerciseObject: getDefaultSettingsOfLevel('exercise', 'object'),
  questionObject: getDefaultSettingsOfLevel('question', 'object'),
};