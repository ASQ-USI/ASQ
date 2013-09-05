/** @module models/slideshow
    @description the Slideshow Model
*/

var mongoose= require('mongoose')
, Schema = mongoose.Schema
, ObjectId = Schema.ObjectId
, when     = require('when');

var slideshowSchema = new Schema({
  title: { type: String },
  course: { type: String, default: "General" },
  originalFile:{type:String},
  teacherFile:{type:String},
  studentFile:{type:String},
  owner: { type: ObjectId },
  questions: [ObjectId],
  questionsPerSlide: [questionsPerSlideSchema],
  statsPerSlide: [statsPerSlideSchema],
  links: {type: Array, default: []},
  lastSession: {type: Date, default: Date.now},
  lastEdit: {type: Date, default: Date.now}
});

//get the path of the slideshow. Usefull to server static files
slideshowSchema.virtual('path').get(function() {
  return './slides/' + this._id + '/';
});

//remove sessions before removing a slideshow
slideshowSchema.pre('remove', true, function(next,done){
  next();
  var Session = db.model('Session');
  Session.findOne({ 
    slides       : this._id,
    isTerminated : false
  }, function(err, session) {
    if (session) {
      return next(new Error('This presentation is being broadcast and cannot be '
        + 'removed.'));
    }
    next();
  });
  // Session.remove({slides : this.id}, function(err){
  //   if (err) { done(err)}
  //   done();
  // })

});

//remove questions before removing a slideshow
// questions will remove the related answers in their own pre()
slideshowSchema.pre('remove', true, function(next,done){
  next();
    var Question = db.model('Question');

  //delete sessions
  Question.remove({_id : {$in : this.questions}}, function(err){
    if (err) { done(err)}
    done();
  })

});


// Adds an array of questionIDs to the slideshow
// Array arr should be populated with questionIDs
slideshowSchema.methods.addQuestions = function(arr, cb){
  return this.update({$addToSet: {questions: {$each: arr}}});
}

// gets all the questions for a specific slide html id
slideshowSchema.methods.getQuestionsForSlide = function(slideHtmlId){
  for (var i=0; i < this.questionsPerSlide.length; i++){
    if(this.questionsPerSlide[i].slideHtmlId == slideHtmlId){
      return this.questionsPerSlide[i].questions;
    }
  }
  return [];
}

// gets all the questions used for stats for a specific slide html id
slideshowSchema.methods.getStatQuestionsForSlide = function(slideHtmlId){

  for (var i=0; i < this.statsPerSlide.length; i++){
    if(this.statsPerSlide[i].slideHtmlId == slideHtmlId){
      return this.statsPerSlide[i].statQuestions;
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

var statsPerSlideSchema = new Schema({
  slideHtmlId:{type:String},
  statQuestions: [ObjectId]
})

var createStatsPerSlide =  function(statsForQuestions){

  var StatsPerSlide = db.model("StatsPerSlide");

  var sPerSlidesObj = {};
  for ( var i=0; i < statsForQuestions.length; i++){
    if (! sPerSlidesObj[statsForQuestions[i].slideHtmlId]){
      sPerSlidesObj[statsForQuestions[i].slideHtmlId] = [];
    }
    sPerSlidesObj[statsForQuestions[i].slideHtmlId].push(statsForQuestions[i].questionId)
  }

  //convert to array
  var sPerSlidesArray = [];

  for (var key in sPerSlidesObj){
    sPerSlidesArray.push(new StatsPerSlide({slideHtmlId : key, statQuestions: sPerSlidesObj[key]}));
  }
  return sPerSlidesArray;
}

mongoose.model("Slideshow", slideshowSchema);
mongoose.model("QuestionsPerSlide", questionsPerSlideSchema);
mongoose.model("StatsPerSlide", statsPerSlideSchema);

module.exports =  {
  slideshowSchema             : slideshowSchema,
  questionsPerSlideSchema     : questionsPerSlideSchema,
  createQuestionsPerSlide     : createQuestionsPerSlide,
  statsPerSlideSchema         : statsPerSlideSchema,
  createStatsPerSlide         : createStatsPerSlide
}