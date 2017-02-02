/** @module models/AbstractQuestion
    @description the abstract question model for questions and rubrics.
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const extend = require('mongoose-schema-extend');
const stats = require('../lib/stats');

// allowed form button types
const formButtonTypes = ['checkbox', 'radio'];
// allowed question types
const questionTypes = ['asq-css-select', 'asq-js-function-body', 'multi-choice', 'text-input', 'code-input'];

// Remove all stat types we don't know about
function statTypesValidator(types) {
  let i = types.length;
  while (i--) {
    if (! stats.hasOwnProperty(types[i])) {
      types.splice(i, 1);
    }
  }
  return true;
}

const abstractQuestionSchema = new Schema({
  stem            : { type: String },
  stemText        : { type: String },
  questionType    : { type: String, enum:questionTypes },
  formButtonType  : { type: String, enum:formButtonTypes },
  statTypes       : { type: [String], default: [], validator:
                      [ statTypesValidator , 'Invalid stat type {PATH}.'] }
}, { discriminatorKey: '_type' });

module.exports = abstractQuestionSchema;