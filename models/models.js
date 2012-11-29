var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



exports.userSchema = new Schema({
	name: { type: String, unique:true },
	password: { type: String },
	slides: { type: Array, default: []},
	current: {type: ObjectId, default: null}

});

exports.slidesSchema = new Schema({
	title: { type: Sting },
	owner: { type: ObjectId },
	questions: {type: Array, default: []}
});

exports.slidesSchema.virtual('path').get(function() {
	return './slides' + this._id;
});

exports.sessionSchema = new Schema({
	presenter: { type: ObjectId },
	slides: { type: ObjectId },
	activeSlide: { type: String, default: '0' },
	date: {type: Date, default: Date.now },
	viewers: {type: Array, default: []}
})