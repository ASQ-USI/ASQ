/**
 * @module models/exercise
 * @description the Exercise Model
 **/


const logger = require('logger-asq');
const _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const assessmentTypes = require('./assessmentTypes');
const presentationSettingSchema = require('./presentationSetting.js');

const exerciseSchema = new Schema({
  stem      : { type: String, default: '' },
  questions : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  settings  : [ presentationSettingSchema ],
});

exerciseSchema.methods.listSettings = function() {
  return this.settings.toObject()
}

exerciseSchema.methods.readSetting = function(key) {
  var settings = this.settings.toObject();
  for ( var i in settings ) {
    if ( settings[i].key === key ) {
      return settings[i].value
    }
  }

  throw 'Key not found';
}


exerciseSchema.methods.updateSetting = coroutine(function* updateSettingsGen(setting) {
  for ( let i in this.settings.toObject() ) {
    const key = this.settings[i].key;
    if ( setting.key === key ) {
      if ( this.settings[i].value !== setting.value ) {
        const old = this.settings[i].value;
        this.settings[i].value = setting.value;

        try{
          yield this.save();
        } catch(e){
          console.log('Warning: failed to update settings. Rollback.', e.message);
          this.settings[i].value = old;
          yield this.save();

          throw e;
        }
      }
    }
  }
}),

exerciseSchema.methods.updateSettings = coroutine(function* updateSettingsGen(settings) {
  var flatten = {}
  if ( _.isArray(settings) ) {
    settings.forEach(function(setting) {
      flatten[setting.key] = setting.value;
    });
  } else {
    flatten = settings;
  }


  if ( this.settings.toObject().length > 0) {
    for ( let i in this.settings.toObject() ) {
      const key = this.settings[i].key;
      if ( flatten.hasOwnProperty(key) ) {
        if ( this.settings[i].value !== flatten[key] ) {
          this.settings[i].value = flatten[key];
        }
      }
    }
  } else {
    this.settings = settings;
  }

  yield this.save();
})

logger.debug('Loading Exercise model');

mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
