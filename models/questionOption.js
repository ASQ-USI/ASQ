/**
 * @module models/questionOption
 * @description the question option sub document model.
 **/

 var mongoose = require('mongoose')
 , Schema     = mongoose.Schema

var questionOptionSchema = new Schema({
  text      : { type: String, required: true },
  classList : { type: String, required: true, default: '' },
  correct   : { type: Boolean, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

module.exports = questionOptionSchema;