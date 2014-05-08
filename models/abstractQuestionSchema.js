/** @module models/AbstractQuestion
    @description the abstract question model for questions and rubrics.
*/

var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, extend     = require('mongoose-schema-extend')
, when       = require('when')
, wkeys      = require('when/keys')
, stats      = require('../lib/stats');

// allowed form button types
var formButtonTypes = ['checkbox', 'radio'];
// allowed question types
var questionTypes = ['multi-choice', 'text-input', 'code-input'];

// Remove all stat types we don't know about
function statTypesValidator(types) {
  var i = types.length;
  while (i--) {
    if (! stats.hasOwnProperty(types[i])) {
      types.splice(i, 1);
    }
  }
  return true;
}

var abstractQuestionSchema = new Schema({
  stem            : { type: String },
  stemText        : { type: String },
  questionType    : { type: String, enum:questionTypes },
  formButtonType  : { type: String, enum:formButtonTypes },
  statTypes       : { type: [String], default: [], validator:
                      [ statTypesValidator , 'Invalid stat type {PATH}.'] }
}, { discriminatorKey: '_type' });

module.exports = abstractQuestionSchema;