/**
 * @module models/rubric
 * @description the Rubric Model
 **/

var mongoose               = require('mongoose');
var Schema                 = mongoose.Schema;
var ObjectId               = Schema.ObjectId;
var when                   = require('when');
var wkeys                  = require('when/keys');
var Answer                 = db.model('Answer');
var abstractQuestionSchema = require('./abstractQuestionSchema');
var stats                  = require('../lib/stats');
var logger                 = require('logger-asq');

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

logger.debug('Loading Rubric model');
mongoose.model('Rubric', rubricSchema, 'rubrics');

module.exports = mongoose.model('Rubric');