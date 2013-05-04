/** @module models/question
    @description the Questions Model
*/

var mongoose = require('mongoose')
, Schema = mongoose.Schema;

// allowed form button types
var formButtonTypes = 'checkbox radio'.split(' ');

var questionSchema = new Schema({
  htmlId: {type:String},
  stem: {type: String},
  formButtonType: {type:String, enum:formButtonTypes},
  questionOptions: [questionOptionSchema]
});

mongoose.model("Question",questionSchema);

var questionOptionSchema = new Schema({
  text:{type:String},
  correct:{type: Boolean}
})

mongoose.model("QuestionOption",questionOptionSchema);


var create =  function(doc, cb){
  var Question = db.model("Question");

  Question.create(doc, function(err){
    console.log("Error: " + err)
    //  for (var i=1; i<arguments.length; ++i) {
    //     var question = arguments[i];
    //     console.log(question)
    //     // do some stuff with candy
    // }
    cb();
  });
}

module.exports =  {
  questionSchema          : questionSchema,
  questionOptionSchema    : questionOptionSchema,
  create                  : create
}