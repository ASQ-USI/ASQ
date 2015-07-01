/**
 * @module models/exercise
 * @description the Exercise Model
 **/

var mongoose         = require('mongoose')
  , Schema           = mongoose.Schema
  , ObjectId         = Schema.ObjectId
  , Promise    = require("bluebird")
  , coroutine  = Promise.coroutine
  , assessmentTypes  = require('./assessmentTypes')
  , appLogger        = require('../lib/logger').appLogger;
  Setting            = db.model('Setting');

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

appLogger.debug('Loading Exercise model');
mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
