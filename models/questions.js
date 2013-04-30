var mongoose = require('mongoose')
, Schema = mongoose.Schema;

// allowed form button types
var formButtonTypes = 'checkbox radio'.split(' ');

var questionSchema = new Schema({
  htmlId: {type:String}
  stem: {type: String},
  formButtonType: {type:String, enum:formButtonTypes}
  options: [optionSchema]
});

var optionSchema = new Schema({
  text:{type:String}
  correct:{type: Boolean}
})

exports.questionSchema = questionSchema;
exports.optionSchema = optionSchema;