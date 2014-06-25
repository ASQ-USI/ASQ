/** @module models/answer
    @description the Answers Model
*/

var mongoose      = require('mongoose')
 // , questionModel = require('./question') // Can't call question from answer because question call answers...
  , Schema        = mongoose.Schema
  , ObjectId      = Schema.ObjectId
  , when          = require('when')
  , arrayEqual    = require('../lib/utils/stats').arrayEqual
  , appLogger     = require('../lib/logger').appLogger
  , Assessment    = db.model('Assessment');

var answerSchema = new Schema({
  exercise    : { type: ObjectId, ref: 'Exercise', required: true },
  question    : { type: ObjectId, ref: 'Question', required: true },
  answeree    : { type: ObjectId, ref: 'WhitelistEntry', required: true },
  session     : { type: ObjectId, ref: 'Session', required: true },
  submission  : [],
  confidence  : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
  logData     : [answerLogSchema]
});

answerSchema.index({session: 1, answeree: 1, exercise: 1 });


// Saves an automatic assessment for a user submited answer asynchronously
// if there exist a solution for the related question.
answerSchema.pre('save', function autoAssessment(next, done) {
  next();
  var Question = db.model('Question');
  var answer = this;
  Question.findById(answer.question).exec().then(function onQuestion(question) {
    var solution = question.getSolution();
    if (solution === null) {
      done();
      return;
    }
    console.log('COMAPRING')
    console.log(answer.submission);
    console.log(solution);
    var assessment = new Assessment({
      session  : answer.session,
      exercise : answer.exercise,
      question : answer.question,
      rubric   : null,
      answer   : answer._id,
      assessee : answer.answeree,
      assessor : null,
      score    : arrayEqual(answer.submission, solution) ? 100 : 0, // TODO replace that with a finer grained answer method
      status   : 'finished',
      type     : 'auto',
      confidence : answer.confidence //We save the answeree's confidence for the correctness chart.
    });
    assessment.save(function onSave(err) { done(err); });
  });
})

// // saves object and returns a promise
// answerSchema.methods.saveWithPromise = function(){
//   //we cant use mongoose promises because the
//   // save operation returns undefined
//   // see here: https://github.com/LearnBoost/mongoose/issues/1431
//   // so we construct our own promise
//   // to maintain code readability

//   var that = this;
//   var deferred = when.defer(),

//   Question = db.model('Question', questionModel.questionSchema);
//   Question.findById(that.question, function(err, question){
//     if(err){
//       deffered.reject(err);
//     }

//     if(arrayEqual(that.submission, question.getSolution(question))){
//       that.correctness = 100;
//     }else{
//       that.correctness = 0;
//     }

//     that.save(function(err, doc){
//       if (err) {
//         deferred.reject(err);
//         return;
//       } deferred.resolve(doc);
//     });

//   });
//     return deferred.promise;
// };

appLogger.debug('Loading Answer model');
mongoose.model('Answer', answerSchema);

var answerLogSchema = new Schema({
  startTime:{},
  endTime:{},
  totalTime:{},
  keystrokes:{},
  pageactive:{}
});

module.exports = mongoose.model('Answer');