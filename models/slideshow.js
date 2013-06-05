var mongoose= require('mongoose');

var Schema = mongoose.Schema
, ObjectId = Schema.ObjectId
, when     = require('when');

var slideshowSchema= new Schema({
  title: { type: String },
  course: { type: String, default: "General" },
  originalFile:{type:String},
  teacherFile:{type:String},
  studentFile:{type:String},
  owner: { type: ObjectId },
  questions: [ObjectId],
  questionsPerSlide: [questionsPerSlideSchema],
  links: {type: Array, default: []},
  lastSession: {type: Date, default: Date.now},
  lastEdit: {type: Date, default: Date.now}
});

//get the path of the slideshow. Usefull to server static files
slideshowSchema.virtual('path').get(function() {
  return './slides/' + this._id + '/';
});

// Adds an array of questionIDs to the slideshow
// Array arr should be populated with questionIDs
slideshowSchema.methods.addQuestions = function(arr, cb){
  return this.update({$addToSet: {questions: {$each: arr}}});
}

// gets all the questios for a specific slide html id
slideshowSchema.methods.getQuestionsForSlide = function(slideHtmlId){
  for (var i=0; i < this.questionsPerSlide.length; i++){
    if(this.questionsPerSlide[i].slideHtmlId == slideHtmlId){
      return this.questionsPerSlide[i].questions;
    }
  }
  return [];
}

// saves object and returns a promise
slideshowSchema.methods.saveWithPromise = function(){
  //we cant use mongoose promises because the
  // save operation returns undefined
  // see here: https://github.com/LearnBoost/mongoose/issues/1431
  // so we construct our own promise
  // to maintain code readability

  var deferred = when.defer();
  this.save(function(err, doc){
    if (err) {
      deferred.reject(err);
      return;
    }
    deferred.resolve(doc);
  });

  return deferred.promise;
}

var questionsPerSlideSchema = new Schema({
  slideHtmlId:{type:String},
  questions: [ObjectId]
})

var createQuestionsPerSlide =  function(questions){

  var QuestionsPerSlide = db.model("QuestionsPerSlide");

  var qPerSlidesObj = {};
  for ( var i=0; i < questions.length; i++){
    if (! qPerSlidesObj[questions[i].slideHtmlId]){
      qPerSlidesObj[questions[i].slideHtmlId] = [];
    }
    qPerSlidesObj[questions[i].slideHtmlId].push(questions[i].id)
  }

  //convert to array
  var qPerSlidesArray = [];

  for (var key in qPerSlidesObj){
    qPerSlidesArray.push(new QuestionsPerSlide({slideHtmlId : key, questions: qPerSlidesObj[key]}));
  }
  return qPerSlidesArray;
}

mongoose.model("Slideshow", slideshowSchema);
mongoose.model("QuestionsPerSlide", questionsPerSlideSchema);

module.exports =  {
  slideshowSchema             : slideshowSchema,
  questionsPerSlideSchema     : questionsPerSlideSchema,
  createQuestionsPerSlide     : createQuestionsPerSlide
}