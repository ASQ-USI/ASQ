var mongoose  = require('mongoose')
  , Schema    = mongoose.Schema
  , ObjectId  = Schema.ObjectId;

var assessmentSchema = new Schema({
  session  : { type: ObjectId, ref: 'Answer', required: true }
  answer   : { type: ObjectId, ref: 'Answer', required: true },
  assessee : { type: ObjectId, ref: 'User', required: true },
  assessor : { type: ObjectId, ref: 'User', required: true },
  score    : { type: Number, min: 1, max: 5, default: 0 }, // 0 = not set
  category : { type: String, lowercase: true, enum: [ 'self', 'peer', 'pro' ],
               required: true }
});

assessmentSchema.index({
  answer   : 1,
  assessee : 1,
  assessor : 1
}, { unique : true });

mongoose.model('Assessment', assessmentSchema);

module.exports = {
  assessmentSchema : assessmentSchema
};