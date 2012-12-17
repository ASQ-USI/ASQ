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

var questionSchema=new Schema({
	questionText: {type: String},
	questionType: {type: String},
	afterslide: {type: String},
	answeroptions: {type: [ObjectId], ref: 'Option'}
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
	question: {type: ObjectId, ref:'Question'},
	answers: [{
		user: {type: String}, 
		content: {type: Array, default: []} ,
		final: {type: Boolean, default: true}
	}]
})

exports.answerSchema = answerSchema;

var sessionSchema = new Schema({
	presenter: { type: ObjectId, ref: 'User'},
	slides: { type: ObjectId },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []},
	answers: {type:[ObjectId], ref: 'Answer'},
	showingQuestion: {type: Boolean, default: false},
	showingAnswer: {type: Boolean, default: false},
	started: {type: Boolean, default: false},
	questionsDisplayed: {type: [ObjectId], ref: 'Question'}
});

sessionSchema.methods.question = function(callback) {
	var that = this;
	var Slideshow = db.model('Slideshow', slideshowSchema);
	Slideshow.findById(this.slides, function(err, slideshow) {
		if (slideshow) {
			var Question = db.model('Question', questionSchema);
		Question.findOne({$and: [ {_id: { $in: slideshow.questions }}, {_id: {$nin: that.questionsDisplayed}}],
						afterslide: that.activeSlide},
				        function(err, question) {
							console.log('question');
							console.log(question);
							console.log(that.activeSlide);
							callback(err, question);
						});
		}
		
	});
}

sessionSchema.set('toJSON', { virtuals: true });

exports.sessionSchema = sessionSchema;

var optionSchema = new Schema( {
	optionText: {type: String},
	correct: {type: Boolean, default: false}
});

exports.optionSchema = optionSchema;

var questionSchema = new Schema({
	questionText: {type: String},
	questionType: {type: String},
	afterslide: {type: String},
	answeroptions: [{type: ObjectId, ref: 'Option'}]
});

questionSchema.methods.displayQuestion = function(answer, callback) {
	answer = answer || false;
	var that = this;
	var Option = db.model('Option', optionSchema);
	Option.find({_id: {$in: this.answeroptions}})
	.select(answer ? {_id: 0, __v: 0} : {correct: 0, _id: 0, __v: 0})
	.exec(function(err, options) {
		if(err) console.log(err);
		console.log(options);
		callback(err, {_id: that._id,
					   questionText: that.questionText,
					   questionType: that.questionType,
					   answeroptions:options});
	});
}

exports.questionSchema = questionSchema;
