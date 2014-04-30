/**
 * @module models/criterion
 * @description the criterion sub document model for rubrics.
 **/

 var mongoose = require('mongoose')
 , Schema     = mongoose.Schema

var criterionSchema = new Schema({
  desc   : { type: String, required: true },
  points : { type: Number, required: true },
  label  : { type: String, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

module.exports = criterionSchema;