/** @module models/question
    @description the Questions Model
*/

var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, when        = require('when');

// allowed form button types
var formButtonTypes = 'checkbox radio'.split(' ');
// allowed question types
var questionTypes = 'multi-choice text-input'.split(' ');

var questionSchema = new Schema({
  // htmlId: {type:String},
  stem: {type: String},
  stemText: {type: String},
  questionType: {type:String, enum:questionTypes},
  formButtonType: {type:String, enum:formButtonTypes},
  correctAnswer: {type:String},
  questionOptions: [questionOptionSchema]
});

var questionOptionSchema = new Schema({
  text:{type:String},
  classList: {type:String},
  correct:{type: Boolean}
})

//remove answers before removing a question
questionSchema.pre('remove', true, function(next,done){
  next();
   var Answer = db.model('Answer');

  //delete sessions
  Answer.remove({question : this.id}, function(err){
    if (err) { done(err)}
    done();
  })
});

//Returns array with solution
questionSchema.methods.getSolution = function(){
	
			var result = new Array;
			if(this.questionType == "multi-choice"){
				for (var i=0; i < this.questionOptions.length; i++) {
			  		result.push(this.questionOptions[i].correct);
				};
			}else{
				result.push(this.correctAnswer);
			}
			console.log(result);
			return result;

}

mongoose.model("Question",questionSchema);
mongoose.model("QuestionOption",questionOptionSchema);

var create =  function(docs){
  //we cant use mongoose promises because the
  // save operation returns undefined
  // see here: https://github.com/LearnBoost/mongoose/issues/1431
  // so we construct our own promise
  // to maintain code readability

  var deferred = when.defer()
  , Question = db.model("Question");

  Question.create(docs, function(err){
    if (err) {
      deferred.reject(err);
      return;
    }

    // aggregate saved docs
    var docs = [];
    for (var i=1; i<arguments.length; ++i) {
        docs.push(arguments[i]);
    }
    deferred.resolve(docs);
  });

  return deferred.promise;
}

module.exports =  {
  questionSchema          : questionSchema,
  questionOptionSchema    : questionOptionSchema,
  create                  : create
}