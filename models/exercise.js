/**
 * @module models/exercise
 * @description the Exercise Model
 **/

var mongoose   = require('mongoose')
  , Schema     = mongoose.Schema
  , ObjectId   = Schema.ObjectId
  , appLogger  = require('../lib/logger').appLogger;


var exerciseSchema = new Schema({
  questions : { type: [{ type: ObjectId, ref: 'Question' }] }
});

appLogger.debug('Loading Exercise model');
mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');