/**
 * @module models/settings
 * @description the Settings Model
*/

'use strict';

var mongoose   = require('mongoose')
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var Promise    = require('bluebird');
var coroutine  = Promise.coroutine;
var _          = require('lodash');
var logger     = require('../lib/logger').appLogger;
var defaultSettings;

// adopted from https://github.com/TryGhost/Ghost
// For neatness, the defaults file is split into categories.
// It's much easier for us to work with it as a single level
// instead of iterating those categories every time
function parseDefaultSettings() {
    var defaultSettingsInCategories = require('../data/defaultSettings.json'),
        defaultSettingsFlattened = {};

    _.each(defaultSettingsInCategories, function (settings, categoryName) {
        _.each(settings, function (setting, settingName) {

            var info = {
              value: setting,
              category: categoryName,
              key: settingName,
            };

            defaultSettingsFlattened[settingName] = info;
        });
    });

    return defaultSettingsFlattened;
}

function getDefaultSettings() {
    if (!defaultSettings) {
        defaultSettings = parseDefaultSettings();
    }

    return defaultSettings;
}

var kinds = [ 'String',   //text
              'Number',   //number
              'Date',     //date
              'Boolean',   //checkbox
              'Select',
              'Range'
            ];

var settingSchema = new Schema({
    key       : { type : String, required : true},
    value     : { type : {}},
    select    : { type : Boolean, default: false},
    options   : { type : Array, default: [] },
    kind      : { type : String, required: true, enum: kinds},

    category  : { type : String , required : true, default: 'core' },
    createdAt : { type : Date, default: Date.now },
    createdBy : { type : ObjectId, ref: 'User' },
    updatedAt : { type : Date, default: Date.now },
    updatedBy : { type : ObjectId, ref: 'User' }
});


// adopted from https://github.com/TryGhost/Ghost/
settingSchema.statics.populateDefaults = coroutine(function *populateDefaultsGen() {

  var allSettings = yield this.find({}).lean().exec();

  var usedKeys = allSettings.map(function (setting) { return setting.key; });
  var insertOperations = [];

  _.each(getDefaultSettings(), function (defaultSetting, defaultSettingKey) {
    var isMissingFromDB = usedKeys.indexOf(defaultSettingKey) === -1;

    if (isMissingFromDB) {
      var newSetting = {
        key: defaultSettingKey,
        value: defaultSetting.value,
        category: defaultSetting.category
      }
      insertOperations.push(this.create(newSetting));
    }
  }.bind(this));

  return Promise.all(insertOperations);
});

logger.debug('Loading settings model');
mongoose.model('Setting', settingSchema);

module.exports = mongoose.model('Setting');