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
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  assessmentTypes   : { type: [{ type: String, enum: assessmentTypes }], default: [] },
  maxNumSubmissions : { type: Number, default: 1 },
  confidence        : { type: Boolean, default: false }
});


exerciseSchema.virtual('allowResubmit').get(function allowResubmit() {
  return this.assessmentTypes.indexOf('self') === -1 &&
    this.assessmentTypes.indexOf('peer') > -1 && this.resubmit;
    
  // if (this.assessmentTypes.indexOf('self') === -1 && 
  //   this.assessmentTypes.indexOf('peer') > -1) {
  //   return this.maxNumSubmissions
  // }
})

exerciseSchema.set('toObject', { virtuals: true });
exerciseSchema.set('toJSON', { virtuals: true });

appLogger.debug('Loading Exercise model');
mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
