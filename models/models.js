var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;



exports.photoalbum = new Schema({
	id: { type: String},
  name: { type: String},
  path: { type: String},
  link: { type: String},
  description: { type: String},
  dateCreation: { type:String},
  contentType: { type: String}
});