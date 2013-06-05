var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId
, when        = require('when');



userSchema = new Schema({
	name: { type: String, unique:true },
	password: { type: String },
	email: {type:String},
	slides: {type: [ObjectId], default: []},
	current: {type: ObjectId, default: null}
});

mongoose.model("User", userSchema);

exports = {
	userSchema : userSchema
}


// exports.questionSchema = new Schema({
// 	stem : {type:String},
// 	type : {}
// 	body : {}
// });

// exports

// var slideshowSchema= new Schema({
// 	title: { type: String },
// 	course: { type: String, default: "General" },
// 	owner: { type: ObjectId },
// 	questions: [ObjectId],
// 	links: {type: Array, default: []},
// 	lastSession: {type: Date, default: Date.now},
// 	lastEdit: {type: Date, default: Date.now}
// });

//  exports.slideshowSchema = slideshowSchema; 

// exports.slideshowSchema.virtual('path').get(function() {
// 	return './slides/' + this._id + '/';
// });

// exports.slideshowSchema.set('toJSON', { virtuals: true });
/**
var answerSchema = new Schema({
	question: {type: ObjectId, ref:'Question'},
	answers: [{
		user: {type: String}, 
		content: {type: Array, default: []} ,
		final: {type: Boolean, default: true}
	}]
})

mongoose.model("Answer", answerSchema);
exports.answerSchema = answerSchema;
*/
var sessionSchema = new Schema({
	presenter: { type: ObjectId, ref: 'User'},
	slides: { type: ObjectId },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []},
	answers: {type:[ObjectId], ref: 'Answer'},
	showingQuestion: {type: Boolean, default: false}, //maybe don't need it
	showingAnswer: {type: Boolean, default: false}, //maybe don't need it
	started: {type: Boolean, default: false}, 
	questionsDisplayed: {type: [ObjectId], ref: 'Question'}, //maybe don't need it
  activeQuestions: [ObjectId]
});

sessionSchema.methods.questionsForSlide = function(slideHtmlId) {

  var deferred = when.defer()
  , Slideshow = db.model('Slideshow');

  Slideshow.findById(this.slides).exec()
    .then(function(slideshow){
      deferred.resolve(slideshow.getQuestionsForSlide(slideHtmlId));
    }
   ,function(err, slideshow) {
      throw err;  
  });

  return deferred.promise;
}

/**
* @ function isQuestionInSlide
* @description Checks if the questionId is inside a slide
* with an id of slideHtmlId, in the session;
*/

sessionSchema.methods.isQuestionInSlide = function(slideHtmlId, questionId) {

  var deferred = when.defer();

  this.questionsForSlide(slideHtmlId)
    .then(function(questions){
      for (var i=0; i<questions.length; i++){
        if(questions[i]== questionId){
           deferred.resolve(true);
        }
      }
      deferred.resolve(false);
    })
  return deferred.promise;
}

// sessionSchema.methods.question = function(callback) {
// 	var that = this;
// 	var Slideshow = db.model('Slideshow');
// 	Slideshow.findById(this.slides, function(err, slideshow) {
// 		if (slideshow) {
// 			var Question = db.model('Question');
// 		Question.findOne({$and: [ {_id: { $in: slideshow.questions }}, {_id: {$nin: that.questionsDisplayed}}],
// 						afterslide: that.activeSlide},
// 				        function(err, question) {
// 							console.log('question');
// 							console.log(question);
// 							console.log(that.activeSlide);
// 							callback(err, question);
// 						});
// 		}
		
// 	});
// }

sessionSchema.set('toJSON', { virtuals: true });

mongoose.model("Session", sessionSchema);

exports.sessionSchema = sessionSchema;

// var optionSchema = new Schema( {
// 	optionText: {type: String},
// 	correct: {type: Boolean, default: false}
// });

// exports.optionSchema = optionSchema;

// var questionSchema = new Schema({
// 	questionText: {type: String},
// 	questionType: {type: String},
// 	afterslide: {type: String},
// 	answeroptions: [{type: ObjectId, ref: 'Option'}]
// });

// questionSchema.methods.displayQuestion = function(answer, callback) {
// 	answer = answer || false;
// 	var that = this;
// 	var Option = db.model('Option', optionSchema);
// 	Option.find({_id: {$in: this.answeroptions}})
// 	.select(answer ? {_id: 0, __v: 0} : {correct: 0, _id: 0, __v: 0})
// 	.exec(function(err, options) {
// 		if(err) console.log(err);
// 		console.log(options);
// 		callback(err, {_id: that._id,
// 					   questionText: that.questionText,
// 					   questionType: that.questionType,
// 					   answeroptions:options});
// 	});
// }

// exports.questionSchema = questionSchema;


// var answerSchema = new Schema({
//   question   	: {type: ObjectId, ref:'Question'},
//   answeree   	: String, // student that answered the question
//   session		: {type: ObjectId, ref:'Session'},
//   submission 	: {},
//   correctness	: { type: Number, min: 0, max: 100 },
//   logData 		: [answerLogSchema]
// });

// mongoose.model("Answer", answerSchema);

// var answerLogSchema = new Schema({
//   startTime:{},
//   endTime:{},
//   totalTime:{},
//   keystrokes:{},
//   pageactive:{}
  
// })

// mongoose.model("AnswerLog",answerLogSchema);

// module.exports =  {
//   answerSchema    : answerSchema,
//   answerLogSchema : answerLogSchema
// }

