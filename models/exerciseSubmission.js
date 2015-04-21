/** @module models/exerciseSUbmission
    @description the ExerciseSubmission Model
*/

var mongoose      = require('mongoose')
  , Schema        = mongoose.Schema
  , ObjectId      = Schema.ObjectId
  , appLogger     = require('../lib/logger').appLogger;

var exerciseSubmissionSchema = new Schema({
  exercise   : { type: ObjectId, ref: 'Exercise', required: true },
  answeree   : { type: ObjectId, ref: 'WhitelistEntry', required: true },
  session    : { type: ObjectId, ref: 'Session', required: true },
  submitDate : { type: Date, required: true, default: Date.now },
  answers : {},
  confidence : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
});

exerciseSubmissionSchema.index({ session: 1, answeree: 1, exercise: 1, submitDate: 1 });

appLogger.debug('Loading ExerciseSubmission model');
mongoose.model('ExerciseSubmission', exerciseSubmissionSchema);

module.exports = mongoose.model('ExerciseSubmission');