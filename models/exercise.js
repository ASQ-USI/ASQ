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
var Setting          = db.model('Setting');


var exerciseSchema = new Schema({
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  assessmentTypes   : { type: [{ type: String, enum: assessmentTypes }], default: [] },
  settings          : { type: [{ type: ObjectId, ref: 'Setting' }], default: [] },
});


exerciseSchema.virtual('allowResubmit').get(function allowResubmit() {
  return this.assessmentTypes.indexOf('self') === -1 &&
    this.assessmentTypes.indexOf('peer') > -1 && this.resubmit;
})

exerciseSchema.set('toObject', { virtuals: true });
exerciseSchema.set('toJSON', { virtuals: true });


exerciseSchema.methods.getSettings = coroutine(function* getSettingsGen() {
  var settings = [];
  for ( var i=0; i<this.settings.length; i++ ) {
    var tmp = yield Setting.findById(this.settings[i]).exec();
    settings.push(tmp);
  }
  return settings;
});

logger.debug('Loading Exercise model');

mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
