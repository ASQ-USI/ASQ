var mongoose  = require('mongoose')
, Schema    = mongoose.Schema
, ObjectId  = Schema.ObjectId
, appLogger     = require('../lib/logger').appLogger;

var assessmentDetailSchema = new Schema({
  label : { type: String, require: true },
  score : { type:Number, min: 0, required: true },
  desc  : { type: String, required: true }
});

var assessmentSchema = new Schema({
  session  : { type: ObjectId, ref: 'Answer', required: true },
  answer   : { type: ObjectId, ref: 'Answer', required: true },
  assessee : { type: ObjectId, ref: 'WhitelistEntry', required: true }, //TODO: decide if ref token or id?
  assessor : { type: ObjectId, ref: 'WhitelistEntry', required: true }, //TODO: decide if ref token or id?
  score    : { type: Number, min: 0, max: 5, required: true },
  type     : { type: String, lowercase: true, enum: [ 'self', 'peer', 'pro' ],
               required: true },
  details  : { type: [assessmentDetailSchema], default: [] }
});

assessmentSchema.index({
  answer   : 1,
  assessee : 1,
  assessor : 1,
}, { unique : true });

appLogger.debug('Loading Assessment model');
mongoose.model('Assessment', assessmentSchema);

module.exports = {
  assessmentSchema : assessmentSchema
};