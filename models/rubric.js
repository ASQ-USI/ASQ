/**
 * @module models/rubric
 * @description the Rubric Model
 **/

var mongoose             = require('mongoose')
, Schema                 = mongoose.Schema
, ObjectId               = Schema.ObjectId
, when                   = require('when')
, wkeys                  = require('when/keys')
, Answer                 = db.model('Answer')
, abstractQuestionSchema = require('./abstractQuestionSchema')
, stats                  = require('../lib/stats')
, appLogger              = require('../lib/logger').appLogger;

var criterionSchema = new Schema({
  desc   : { type: String, required: true },
  points : { type: Number, required: true },
  label  : { type: String, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

var rubricSchema = abstractQuestionSchema.extend({
  criteria:     { type: [criterionSchema], required: false },
  question:     { type: ObjectId, ref: 'Question', required: true },
  maxScore:     { type: Number, required: true }, // Max score the rubric can have.
  deductPoints: { type: Boolean, default: false }
});

appLogger.debug('Loading Rubric model');
mongoose.model('Rubric', rubricSchema, 'rubrics');

module.exports = mongoose.model('Rubric');