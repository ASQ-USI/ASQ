/** @module models/answer
    @description the Answers Model
*/


var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, when        = require('when');

var answerSchema = new Schema({
  question   	: {type: ObjectId, ref:'Question'},
  answeree   	: String, // student that answered the question
  session		: {type: ObjectId, ref:'Session'},
  submission 	: {},
  correctness	: { type: Number, min: 0, max: 100 },
  logData 		: [answerLogSchema]
});

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
