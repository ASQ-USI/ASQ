/** @module models/exerciseSUbmission
    @description the ExerciseSubmission Model
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const logger = require('logger-asq');
const SessionEvent = db.model('SessionEvent');

const exerciseSubmissionSchema = new Schema({
  exercise   : { type: ObjectId, ref: 'Exercise', required: true },
  answeree   : { type: ObjectId, ref: 'WhitelistEntry', required: true },
  session    : { type: ObjectId, ref: 'Session', required: true },
  submitDate : { type: Date, required: true, default: Date.now },
  answers : {},
  confidence : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
});

exerciseSubmissionSchema.index({ session: 1, answeree: 1, exercise: 1, submitDate: 1 });

// Create a sessionEvent
exerciseSubmissionSchema.post('save', function(exerciseSubmission){
  SessionEvent.create({
    session: exerciseSubmission.session,
    type: 'exercise-submit',
    data: {
      answeree: exerciseSubmission.answeree,
      exerciseSubmission: exerciseSubmission._id
    }
  })
})

logger.debug('Loading ExerciseSubmission model');
mongoose.model('ExerciseSubmission', exerciseSubmissionSchema);

module.exports = mongoose.model('ExerciseSubmission');