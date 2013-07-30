/** @module models/session
    @description the Session Model
*/

var mongoose  = require('mongoose')
, Schema      = mongoose.Schema
, ObjectId    = Schema.ObjectId
, when        = require('when');


var sessionSchema = new Schema({
	presenter: { type: ObjectId, ref: 'User'},
	slides: { type: ObjectId, ref: 'Slideshow' },
  authLevel: { type: String, default: 'public', enum: ['public', 'anonymous', 'private'] },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []},
  
	answers: {type:[ObjectId], ref: 'Answer'},
	showingQuestion: {type: Boolean, default: false}, //maybe don't need it
	showingAnswer: {type: Boolean, default: false}, //maybe don't need it
	started: {type: Boolean, default: false}, 
	questionsDisplayed: {type: [ObjectId], ref: 'Question'}, //maybe don't need it
  activeQuestions: [ObjectId],
  activeStatsQuestions : [ObjectId]
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

sessionSchema.methods.statQuestionsForSlide = function(slideHtmlId) {

  var deferred = when.defer()
  , Slideshow = db.model('Slideshow');

  Slideshow.findById(this.slides).exec()
    .then(function(slideshow){
      deferred.resolve(slideshow.getStatQuestionsForSlide(slideHtmlId));
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

module.exports = {
  sessionSchema : sessionSchema
}
