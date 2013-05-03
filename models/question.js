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


var createlo =  function(doc, cb){
  console.log(doc)
  var Question = mongoose.model("Question");
  Question.create(doc, function(err){
    console.log("Error: " + err)
    console.log("KOble: " +koble)
  });
}

module.exports =  {
  questionSchema          : questionSchema,
  questionOptionSchema    : questionOptionSchema,
  createlo                  : createlo
}