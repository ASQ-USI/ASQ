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
  settings          : { type: [{ type: ObjectId, ref: 'Setting' }], default: [] },
});



exerciseSchema.set('toObject', { virtuals: true });
exerciseSchema.set('toJSON', { virtuals: true });


exerciseSchema.methods.getSettings = coroutine(function* getSettingsGen() {
  return yield Setting.find({_id: {$in: this.settings}}).exec();
});

logger.debug('Loading Exercise model');

mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
