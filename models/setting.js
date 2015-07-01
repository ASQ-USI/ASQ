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

var kinds = [ 'string',   
              'number',   
              'date',     
              'boolean',  
              'select',
              'range'
            ];

var settingSchema = new Schema({
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

settingSchema.pre('save', true, function checkParams(next, done){
  next();

  if(validatorFn.hasOwnProperty(this.kind)){
    var r = validatorFn[this.kind].bind(this)();
    if ( !r.valid ) {
      var message = '@' + this.kind + ': ' + r.message;
      return done(new Error(message));
    }
  } else {
    var message = '`Kind` ' + this.kind + ' is not valid.';
    return done(new Error(message));
  }

  done();
})

var validatorFn = {
  'string' : function stringValidator(){ 
    var valid = _.isString(this.value);
    var message = valid ? 'OK' : 'Field `value` should be a string.'
    return {
      valid: valid,
      message: message
    };
  },   
  'number' : function numberValidator(){ 
    var valid = ! isNaN(this.value);
    var message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value` should be a number.'
    };

    return {
      valid: true,
      message: 'OK'
    }
  },   
  'date'   : function dateValidator(){ 
    var valid = _.isDate(this.value);
    var message = valid ? 'OK' : 'Field `value` should be a Date object.'
    return {
      valid: valid,
      message: message
    };
  },     
  'boolean': function booleanValidator(){ 
    var regexTrue = /^true$/i;
    var regexFalse = /^false$/i;
    var valid = _.isBoolean(this.value) || regexTrue.test(this.value) || regexFalse.test(this.value); 
    var message = valid ? 'OK' : 'Field `value` should be a boolean.'
    return {
      valid: valid,
      message: message
    };
  },  
  'select' : function selectValidator(){ 
    var valid = _.isString(this.value);
    var message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value` should be a string.'
    };

    if ( ! (this.params.hasOwnProperty('options') && _.isArray(this.params['options']) ) ) {
      valid = false;
      message = 'Parameter `options` not found or `options` is not an array.';
    }
    if (!valid) return {
      valid: valid,
      message: message
    };
    for ( var i in this.params.options) {
      if ( !_.isString(this.params.options[i]) ) {
        return {
          valid: false,
          message: 'Parameter `options` can only conatin strings.'
        }
      }
    }
    return {
      valid: true,
      message: 'OK'
    }

  },
  'range'  : function rangeValidator(){ 
    var valid = ! isNaN(this.value);
    var message = '';
    if (!valid) return {
      valid: valid,
      message : 'Field `value` should be a number.'
    };

    if ( ! (this.params.hasOwnProperty('min') && ! isNaN(this.params['min']) ) ) {
      valid = false;
      message = 'Parameter `min` not found or `min` is not a number.';
    }

    if ( ! (this.params.hasOwnProperty('max') && ! isNaN(this.params['max']) ) ) {
      valid = false;
      message = 'Parameter `max` not found or `min` is not a number.';
    }

    if ( ! (this.params.hasOwnProperty('step') && ! isNaN(this.params['step']) ) ) {
      valid = false;
      message = 'Parameter `step` not found or `min` is not a number.';
    }

    if (!valid) return {
      valid: valid,
      message: message
    };

    if ( this.params.max < this.params.min ) return {
      valid: false,
      message: 'Parameter `max` should bigger or equal than `min`.'
    }
    return {
      valid: true,
      message: 'OK'
    }

  }
}

logger.debug('Loading settings model');
mongoose.model('Setting', settingSchema);

module.exports = mongoose.model('Setting');