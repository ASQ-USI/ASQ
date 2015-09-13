/**
 * @module models/exercise
 * @description the Exercise Model
 **/


var mongoose         = require('mongoose');
var Schema           = mongoose.Schema;
var ObjectId         = Schema.ObjectId;
var Promise          = require("bluebird");
var coroutine        = Promise.coroutine;
var assessmentTypes  = require('./assessmentTypes');
var logger           = require('logger-asq');
var presentationSettingSchema = require('./presentationSetting.js');
var _ = require('lodash');

var exerciseSchema = new Schema({
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  settings          : [ presentationSettingSchema ],
});


exerciseSchema.methods.updateSettings = coroutine(function* updateSettingsGen(settings) {
  var flatten = {}
  if ( _.isArray(settings) ) {
    settings.forEach(function(setting) {
      flatten[setting.key] = setting.value;
    });
  } else {
    Promise.reject(new errors.NotFoundError('Wrong format. Except an array.'));
  }
  if ( this.settings.length > 0) {
    for ( var i in this.settings ) {
      var key = this.settings[i].key;
      if ( flatten.hasOwnProperty(key) ) {
        if ( this.settings[i].value !== flatten[key] ) {
          this.settings[i].value = flatten[key];
        }
      }
    }
  } else {
    this.settings = settings;
  }
  
  try{
    yield this.save();
    return true
  } catch(e){
    console.log('Warning: failed to update settings. Rollback.');

    for ( var i in this.settings ) {
      var key = this.settings[i].key;
      this.settings[i].value = old[key];
    }

    yield this.save();
    return false
  }
})

logger.debug('Loading Exercise model');

mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
