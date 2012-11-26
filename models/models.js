var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



exports.users = new Schema({
	id : {type: String},
	name: { type: String},
	password: { type: String}
});