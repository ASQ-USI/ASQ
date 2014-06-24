var mongoose  = require('mongoose')
, Schema    = mongoose.Schema
, ObjectId  = Schema.ObjectId
, appLogger     = require('../lib/logger').appLogger;

var assessmentSchema = new Schema({
  session    : { type: ObjectId, ref: 'Session', required: '{PATH} is required.' },
  exercise   : { type: ObjectId, ref: 'Exercise', required: '{PATH} is required.' },
  rubric     : { type: ObjectId, ref: 'Rubric'},
  answer     : { type: ObjectId, ref: 'Answer', required: '{PATH} is required.' },
  assessee   : { type: ObjectId, ref: 'WhitelistEntry', required: '{PATH} is required.' },
  assessor   : { type: ObjectId, ref: 'WhitelistEntry' },
  score      : { type: Number, min: 0, max: 100, required: '{PATH} is required.' },
  confidence : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
  status     : { type: String, lowercase: true,
                 enum: [ 'pending', 'active', 'finished' ], required: '{PATH} is required.' ,
                 default: 'pending' },
  type       : { type: String, lowercase: true,
                 enum: [ 'auto', 'self', 'peer', 'pro' ], required: '{PATH} is required.' },
  submission : { type: Array, default: [] }
});

assessmentSchema.index({
  session  : 1,
  answer   : 1,
  assessee : 1,
  assessor : 1,
  rubric   : 1,
  exercise : 1,
}, { unique : true });

assessmentSchema.index({
  answer   : 1,
  assessee : 1,
  assessor : 1,
  status : 1
});

// We only require a rubric for non automatic assessments.
assessmentSchema.pre('save', function validateRubric(next) {
  if (this.type !== 'auto' && ! this.rubric instanceof ObjectId && !this.assessor instanceof ObjectId) {
    next(new Error('Validation Error: Missing rubric reference.'))
  }
  next();
});

appLogger.debug('Loading Assessment model');
mongoose.model('Assessment', assessmentSchema);

var assessmentJobSchema = new Schema({
  session     : { type: ObjectId, ref: 'Answer', required: true },
  exercise    : { type: ObjectId, ref: 'Exercise', required: true },
  assets      : { type: [assessmentJobAssetsSchema], ref: 'Assessment', required: true },
  assessee    : { type: ObjectId, ref: 'WhitelistEntry', required: true },
  assessor    : { type: ObjectId, ref: 'WhitelistEntry', required: true  },
  status      : { type: String, lowercase: true, enum: [ 'pending', 'active', 'finished' ],
               required: true , default: "pending"},
  type        : { type: String, lowercase: true, enum: [ 'auto', 'self', 'peer', 'pro' ],
               required: true },
});

var assessmentJobAssetsSchema = new Schema({
  question : { type: Object, required: true },
  rubrics : { type: [Object], required: true },
  answer : { type: Object, required: true },
}, { _id: false });


assessmentJobSchema.index({
  exercise   : 1,
  assessee : 1,
  assessor : 1,
  session  : 1,
}, { unique : true });

assessmentJobSchema.index({
  exercise : 1,
  assessee : 1,
  assessor : 1,
  status : 1
});


appLogger.debug('Loading AssessmentJob model');
mongoose.model('AssessmentJob', assessmentJobSchema);



module.exports = mongoose.model('Assessment');
