var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



exports.userSchema = new Schema({
	name: { type: String, unique:true },
	password: { type: String },
	email: {type:String},
	slides: [slideshowSchema],
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
	answeroptions: [optionSchema]
});

exports.questionSchema=questionSchema;

var slideshowSchema= new Schema({
	title: { type: String },
	owner: { type: ObjectId },
	questions: [questionSchema],
	links: {type: Array, default: []}
});

exports.slideshowSchema = slideshowSchema; 

exports.slideshowSchema.virtual('path').get(function() {
	return './slides/' + this._id + '/';
});

var answerSchema = new Schema({
	question: {type: ObjectId} 

})

exports.answerSchema = answerSchema;

exports.sessionSchema = new Schema({
	presenter: { type: ObjectId },
	slides: { type: ObjectId },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []},
	answers:[answerSchema]
})
