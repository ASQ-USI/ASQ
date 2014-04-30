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
, abstractQuestionSchema = require('./abstractQuestion')
, questionOptionSchema   = require('./questionOption')
, criterionSchema        = require('./criterion')
, stats                  = require('../lib/stats')
, appLogger              = require('../lib/logger').appLogger;

var rubricSchema = abstractQuestionSchema.extend({
  criteria: { type: [criterionSchema], required: false },
  question: { type: ObjectId, ref: 'Question', required: true },
  maxScore: { type: Number, required: true } // Max score the rubric can have.
});

rubricSchema.

appLogger.debug('Loading Rubric model');
mongoose.model('Rubric', questionSchema, 'rubrics');

module.exports = rubricSchema;