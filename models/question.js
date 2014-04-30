/** @module models/question
    @description the Questions Model
*/

var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, when       = require('when')
, wkeys      = require('when/keys')
, stats      = require('../lib/stats')
, appLogger  = require('../lib/logger').appLogger;

// allowed form button types
var formButtonTypes = 'checkbox radio'.split(' ');
// allowed question types
var questionTypes = 'multi-choice text-input code-input'.split(' ');

var questionSchema = new Schema({
  // htmlId: {type:String},
    stem            : { type:  String },
    stemText        : { type:  String },
    questionType    : { type: String, enum:questionTypes },
    formButtonType  : { type: String, enum:formButtonTypes },
    correctAnswer   : { type: String },
    questionOptions : [questionOptionSchema],
    statTypes       : {  // TODO: fix this with subdocument without id
      type      : [String],
      default   : [],
      validator : [statTypesValidator, 'Invalid stat type {PATH}.']
    }
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
			}else if(this.correctAnswer){
				result.push(this.correctAnswer);
			}else{
        //FIXME: is this ok?
        result=null;
      }
			console.log(result);
			return result;

}

questionSchema.methods.getStats = function getStats(sessionId) {
  var o = {};
  for(var i = this.statTypes.length; i--;) {
    o[this.statTypes[i]] = stats[this.statTypes[i]](this._id, sessionId);
  }
  return wkeys.all(o);
}

appLogger.debug('Loading Question model');
mongoose.model("Question",questionSchema);
appLogger.debug('Loading QuestionOption model');
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

// Remove all stat types we don't know about
function statTypesValidator(types) {
  for (var i = types.length; i--;) {
    if (! stats.hasOwnProperty(types[i])) {
      types.splice(i, 1);
    }
  }
  return true;
}

module.exports =  {
  questionSchema          : questionSchema,
  questionOptionSchema    : questionOptionSchema,
  create                  : create
}