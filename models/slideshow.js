var mongoose= require('mongoose');

var Schema = mongoose.Schema,
    ObjectId = Schema.ObjectId;

var slideshowSchema= new Schema({
  title: { type: String },
  course: { type: String, default: "General" },
  owner: { type: ObjectId },
  questions: [ObjectId],
  links: {type: Array, default: []},
  lastSession: {type: Date, default: Date.now},
  lastEdit: {type: Date, default: Date.now}
});

// Adds an array of questionIDs to the slideshow
// Array arr should be populated with questionIDs
slideshowSchema.methods.addQuestions = function(arr, cb){
  return this.update({$addToSet: {questions: {$each: arr}}});
}

mongoose.model("Slideshow", slideshowSchema);

exports.slideshowSchema = slideshowSchema; 