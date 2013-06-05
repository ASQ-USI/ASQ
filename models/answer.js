/** @module models/answer
    @description the Answers Model
*/

var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId
, when        = require('when');


var answerSchema = new Schema({
  question   	: {type: ObjectId, ref:'Question'},
  answeree   	: {type:String}, // student that answered the question
  session		  : {type: ObjectId, ref:'Session'},
  submission 	: [],
  correctness	: { type: Number, min: 0, max: 100 },
  logData 		: [answerLogSchema]
});

// saves object and returns a promise
answerSchema.methods.saveWithPromise = function(){
  //we cant use mongoose promises because the
  // save operation returns undefined
  // see here: https://github.com/LearnBoost/mongoose/issues/1431
  // so we construct our own promise
  // to maintain code readability


  var deferred = when.defer();
  this.save(function(err, doc){
    if (err) {
      deferred.reject(err);
      return;
    }
    deferred.resolve(doc);
  });

  return deferred.promise;
}

mongoose.model("Answer", answerSchema);

var answerLogSchema = new Schema({
  startTime:{},
  endTime:{},
  totalTime:{},
  keystrokes:{},
  pageactive:{}
})

mongoose.model("AnswerLog",answerLogSchema);

module.exports =  {
  answerSchema    : answerSchema,
  answerLogSchema : answerLogSchema
}
