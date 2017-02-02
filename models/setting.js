/**
 * @module models/settings
 * @description the Settings Model
*/

'use strict';

const logger     = require('logger-asq');
const mongoose   = require('mongoose');
const Schema     = mongoose.Schema;
const ObjectId   = Schema.ObjectId;
const Promise    = require('bluebird');
const coroutine  = Promise.coroutine;
const _          = require('lodash');

let defaultSettings;


// adopted from https://github.com/TryGhost/Ghost
// For neatness, the defaults file is split into categories.
// It's much easier for us to work with it as a single level
// instead of iterating those categories every time
function parseDefaultSettings() {
    const defaultSettingsInCategories = require('../data/defaultSettings.json'),
        defaultSettingsFlattened = {};

    _.each(defaultSettingsInCategories, function (settings, categoryName) {
        _.each(settings, function (setting, settingName) {

            var info = {
              value: setting.defaultValue,
              category: categoryName,
              key: settingName,
              kind: setting.kind
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

const kinds = [ 'string',   
              'number',   
              'date',     
              'boolean',  
              'select',
              'range',
              'ObjectId'
            ];

const settingSchema = new Schema({
    key       : { type : String, required : true},
    value     : { type : {} },
    kind      : { type : String, required: true, enum: kinds},

    params    : { type: {} },

    category  : { type : String , required : true, default: 'core' },
    createdAt : { type : Date, default: Date.now },
    createdBy : { type : ObjectId, ref: 'User' },
    updatedAt : { type : Date, default: Date.now },
    updatedBy : { type : ObjectId, ref: 'User' }
});


// adopted from https://github.com/TryGhost/Ghost/
settingSchema.statics.populateDefaults = coroutine(function *populateDefaultsGen() {

  const allSettings = yield this.find({}).lean().exec();

  const usedKeys = allSettings.map(function (setting) { return setting.key; });
  const insertOperations = [];

  _.each(getDefaultSettings(), function (defaultSetting, defaultSettingKey) {
    const isMissingFromDB = usedKeys.indexOf(defaultSettingKey) === -1;

    if (isMissingFromDB) {
      const newSetting = {
        key: defaultSettingKey,
        value: defaultSetting.value,
        category: defaultSetting.category,
        kind: defaultSetting.kind
      }
      insertOperations.push(this.create(newSetting));
    }
  }.bind(this));

  return Promise.all(insertOperations);
});


logger.debug('Loading settings model');
mongoose.model('Setting', settingSchema);

module.exports = mongoose.model('Setting');