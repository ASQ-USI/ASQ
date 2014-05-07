/** @module models/answer
    @description the Answers Model
*/

var mongoose      = require('mongoose')
 // , questionModel = require('./question') // Can't call question from answer because question call answers...
  , Schema        = mongoose.Schema
  , ObjectId      = Schema.ObjectId
  , when          = require('when')
  , arrayEqual    = require('../lib/utils/stats').arrayEqual
  , appLogger     = require('../lib/logger').appLogger;



var answerSchema = new Schema({
  question    : {type: ObjectId, ref:'Question'},
  answeree    : {type:String}, // (wle token) student that answered the question
  session     : {type: ObjectId, ref:'Session'},
  submission  : [],
  correctness : { type: Number, min: 0, max: 100 },
  confidence  : { type: Number, min: 0, max: 5, default: 0 }, // 0 = not set
  logData     : [answerLogSchema]
});

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