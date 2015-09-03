var _           = require('lodash');


var defaultSettings = null;


module.exports = {
  parseDefaultSettings: function() {
    var defaults = require('../../data/defaultPresentationSettings.json');

    defaultSettings = {
      presentationLevel: _.clone(defaults['shared'], true).concat(defaults['presentationLevel']),
      exerciseLevel: _.clone(defaults['shared'], true).concat(defaults['exerciseLevel']),
      allLevel: _.clone(defaults['shared'], true).concat(defaults['presentationLevel']).concat(defaults['exerciseLevel'])
    }
    return defaultSettings;
  },

  getDefaultSettingsOfLevel: function(level) {
    if ( ! defaultSettings ) {
      defaultSettings = this.parseDefaultSettings();
    }
    return defaultSettings[level + 'Level'];
  },

  getDefaultSettingsOfLevelAsObject:  function(level) {
    var settingsArray = this.getDefaultSettingsOfLevel(level);
    var settingsObject = {};

    settingsArray.forEach(function(setting) {
      settingsObject[setting.key] = _.clone(setting, true);
    });

    return settingsObject;
  }
}
