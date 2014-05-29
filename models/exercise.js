/**
 * @module models/exercise
 * @description the Exercise Model
 **/

var mongoose         = require('mongoose')
  , Schema           = mongoose.Schema
  , ObjectId         = Schema.ObjectId
  , assessmentTypes = require('./assessmentTypes')
  , appLogger        = require('../lib/logger').appLogger;


var exerciseSchema = new Schema({
  questions : { type: [{ type: ObjectId, ref: 'Question' }], required: true },
  assessment : { type: [{ type: String, enum: assessmentTypes }], default: [] },
  resubmit : { type: Boolean, default: true }
});


exerciseSchema.virtual('allowResubmit').get(function allowResubmit() {
  return this.assessment.indexOf('self') === -1 &&
    this.assessment.indexOf('peer') > -1;
})

appLogger.debug('Loading Exercise model');
mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');