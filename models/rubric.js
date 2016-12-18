/**
 * @module models/rubric
 * @description the Rubric Model
 **/

const logger = require('logger-asq');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Answer = db.model('Answer');
const abstractQuestionSchema = require('./abstractQuestionSchema');
const stats = require('../lib/stats');

const criterionSchema = new Schema({
  desc   : { type: String, required: true },
  points : { type: Number, required: true },
  label  : { type: String, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

const rubricSchema = abstractQuestionSchema.extend({
  criteria:     { type: [criterionSchema], required: false },
  question:     { type: ObjectId, ref: 'Question', required: true },
  maxScore:     { type: Number, required: true }, // Max score the rubric can have.
  deductPoints: { type: Boolean, default: false }
});

logger.debug('Loading Rubric model');
mongoose.model('Rubric', rubricSchema, 'rubrics');

module.exports = mongoose.model('Rubric');