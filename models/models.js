var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



exports.userSchema = new Schema({
	name: { type: String, unique:true },
	password: { type: String },
	email: {type:String},
	slides: {type: [ObjectId], default: []},
	current: {type: ObjectId, default: null}

});

var optionSchema= new Schema( {
	optionText: {type: String},
	correct: {type: String}
});

exports.optionSchema= optionSchema;

var questionSchema=new Schema({
	questionText: {type: String},
	questionType: {type: String},
	afterslide: {type: String},
	answeroptions: [ObjectId]
});

exports.questionSchema=questionSchema;

var slideshowSchema= new Schema({
	title: { type: String },
	course: { type: String, default: "General" },
	owner: { type: ObjectId },
	questions: [ObjectId],
	links: {type: Array, default: []}
});

exports.slideshowSchema = slideshowSchema; 

exports.slideshowSchema.virtual('path').get(function() {
	return './slides/' + this._id + '/';
});

exports.slideshowSchema.set('toJSON', { virtuals: true });

var answerSchema = new Schema({
	question: {type: ObjectId}, 
	answers: [{
		user: ObjectId, 
		content: {type: Array, default: []} 
	}]
})

exports.answerSchema = answerSchema;

var sessionSchema = new Schema({
	presenter: { type: ObjectId },
	slides: { type: ObjectId },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []},
	answers: [answerSchema],
	showingQuestion: {type: Boolean, default: false},
	showingAnswer: {type: Boolean, default: false},
	started: {type: Boolean, default: false}
});

sessionSchema.methods.question = function(callback) {
	var that = this;
	var Slideshow = db.model('Slideshow', slideshowSchema);
	Slideshow.findById(this.slides, function(err, slideshow) {
		var Question = db.model('Question', questionSchema);
		Question.findOne({_id: { $in: slideshow.questions },
						afterslide: that.activeSlide},
				        function(err, question) {;
							callback(err, question);
						});
	});
}

sessionSchema.set('toJSON', { virtuals: true });

exports.sessionSchema = sessionSchema;

exports.answerSchema = new Schema({
	question: {type: ObjectId},
	answers: [{ user: ObjectId,
		    content: {type: Array, default: []}
	}]
});


