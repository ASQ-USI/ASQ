/** @module models/answer
    @description the Answers Model
*/

const logger = require('logger-asq');
const mongoose = require('mongoose');
 // , questionModel = require('./question') // Can't call question from answer because question call answers...
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const arrayEqual = require('../lib/utils/stats').arrayEqual;
const Assessment = db.model('Assessment');
const SessionEvent = db.model('SessionEvent');

const answerLogSchema = new Schema({
  startTime:{},
  endTime:{},
  totalTime:{},
  keystrokes:{},
  pageactive:{}
});

const answerSchema = new Schema({
  exercise   : { type: ObjectId, ref: 'Exercise', required: true },
  question   : { type: ObjectId, ref: 'Question', required: true },
  answeree   : { type: ObjectId, ref: 'WhitelistEntry', required: true },
  session    : { type: ObjectId, ref: 'Session', required: true },
  // TODO: enum answerTypes
  type : { type: String, required: true },
  answerStartTime : { type: Date, required: true, default: Date.now },
  submitDate : { type: Date, required: true, default: Date.now },
  // submission : [],
  submission : { type: Schema.Types.Mixed },
  confidence : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
  logData    : [answerLogSchema],
  upvotes    : { type: [{ type: ObjectId, ref: 'WhitelistEntry' }], default: [] },
  downvotes  : { type: [{ type: ObjectId, ref: 'WhitelistEntry' }], default: [] }
});

answerSchema.index({ session: 1, answeree: 1, exercise: 1, submitDate: 1 });

// Create a sessionEvent
answerSchema.post('save', function(answer){
  SessionEvent.create({
    session: answer.session,
    type: 'answer-submitted',
    data: {
      answeree: answer.answeree,
      answer: answer._id
    }
  })
});


// Saves an automatic assessment for a user submited answer asynchronously
// if there exist a solution for the related question.
// answerSchema.pre('save', function autoAssessment(next, done) {
//   next();
//   var Question = db.model('Question');
//   var answer = this;
//   Question.findById(answer.question).exec().then(function onQuestion(question) {
//     var solution = question.getSolution();
//     if (solution === null) {
//       done();
//       return;
//     }
    
//     var assessment = new Assessment({
//       session  : answer.session,
//       exercise : answer.exercise,
//       question : answer.question,
//       rubric   : null,
//       answer   : answer._id,
//       assessee : answer.answeree,
//       assessor : null,
//       score    : arrayEqual(answer.submission, solution) ? 100 : 0, // TODO replace that with a finer grained answer method
//       status   : 'finished',
//       type     : 'auto',
//       confidence : answer.confidence //We save the answeree's confidence for the correctness chart.
//     });
//     assessment.save(function onSave(err) { done(err); });
//   });
// })

logger.debug('Loading Answer model');
mongoose.model('Answer', answerSchema);

module.exports = mongoose.model('Answer');