/** @module models/slideshow
    @description the Slideshow Model
*/

var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, ObjectId   = Schema.ObjectId
, when       = require('when')
, Promise    = require("bluebird")
, coroutine  = Promise.coroutine
, appLogger  = require('../lib/logger').appLogger
, Question   = db.model('Question')
, User       = db.model('User');

var questionsPerSlideSchema = new Schema({
  slideHtmlId : { type: String, required: true },
  questions   : { type: [{ type: ObjectId, ref: 'Question' }], required: true }
}, { _id: false });

var statsPerSlideSchema = new Schema({
  slideHtmlId   : { type: String, required: true },
  statQuestions : { type: [{ type: ObjectId, ref: 'Question'}], required: true }
}, { _id: false });

var slideshowSchema = new Schema({
  title             : { type: String, required: true },
  course            : { type: String, required: true, default: 'General' },
  originalFile      : { type: String, default: "" },
  asqFile           : { type: String, default: "" },
  presenterFile     : { type: String, default: "" },
  viewerFile        : { type: String, default: "" },
  owner             : { type: ObjectId, ref: 'User', required: true },
  slidesTree        : { type: Object, default:{}},
  thumbnails        : { type: [String], default:[] },
  thumbnailsUpdated : { type: Date }, 
  fontFaces         : { type: [String], default:[] },     
  questions         : { type: [{ type: ObjectId, ref: 'Question' }] },
  questionsPerSlide : { type: [questionsPerSlideSchema] },
  exercisesPerSlide : { type: Schema.Types.Mixed },
  statsPerSlide     : { type: [statsPerSlideSchema] },
  links             : { type: Array, default: [] },
  lastSession       : { type: Date, default: null },
  lastEdit          : { type: Date, default: Date.now }
});

//get the path of the slideshow. Usefull to server static files
slideshowSchema.virtual('path').get(function() {
  return './slides/' + this._id + '/';
});

//check if owner exists
slideshowSchema.pre('save', true, function checkOwnerOnSave(next, done) {
  next();

  User.findOne({_id : this.owner}, function(err, owner) {
    if (err) { done(err); }
    else if (! owner) {
      return done(new Error('Owner field must be a real User _id'));
    }
    done();
  });
});

//check if questions exist
slideshowSchema.pre('save', true, function checkQuestionsOnSave(next, done) {
  next();

  var self = this;
  if (self.questions.length === 0) { return done(); }
  
  Question.find({_id : {$in: this.questions}}, function(err, questions) {
    if (err) { done(err); }
    else if (questions.length !== self.questions.length) {
      return done(new Error(
        'All question items should have a real Question _id'));
    }
    done();
  });
});

//check if questionsPerSlide are valid
slideshowSchema.pre('save', true, function checkQuesPerSlideOnSave(next, done) {
  next();

  var self            = this
  , questions         = self.questions
  , questionsPerSlide =  self.questionsPerSlide;

  //maybe we have no questions
  if (questions.length === 0) {
    if (questionsPerSlide.length === 0) {
      //mo questions no questionsPerslide, we're ok
      return done();
    } else {
      return done(new Error(
        'There are no questions so questionsPerSlide.length should equal 0'));
    }
  }

  // or maybe we have questions but no questionsPerSlide
  if (questionsPerSlide.length === 0) {
    return done(new Error(
      'There are questions: there must be at least a slide with a question.'));
  }


  //check if all questionsPerSlide are  present in the questions array
  var totalQuestions = [];
  questionsPerSlide.forEach(function (qps) {
    qps.questions.forEach(function(q) {

      if (questions.indexOf(q) === -1) {
        return done(new Error(q +
          ' was found in questionsPerSlide but not in the questions array'));
      }

      if (totalQuestions.indexOf(q) === -1) {
       totalQuestions.push(q.toString())
      }
    });
  });

  //check if all questions are  present in the questionsPerSlide array
  questions.forEach(function(q) {
     if (totalQuestions.indexOf(q.toString()) === -1) {
        return done(new Error(q +
          ' was found in questions but not in the questionsPerSlide array'));
      }
  });

  //everything ok
  done();
});


//check if statsPerSlide are valid
slideshowSchema.pre('save', true, function checkStatPerSlideOnSave(next, done) {
  next();

  var self        = this
  , questions     = self.questions
  , statsPerSlide =  self.statsPerSlide;

  //maybe we have no questions
  if (questions.length === 0) {
    if (statsPerSlide.length === 0) {
      //no questions no statsPerslide, we're ok
      return done();
    } else {
      return done(new Error(
        'There are no questions so statsPerSlide.length should equal 0'));
    }
  }

  //check if all statsPerSlide are  present in the questions array
  statsPerSlide.forEach(function(qps) {
    qps.statQuestions.forEach(function(q) {
      if (questions.indexOf(q) === -1) {
        return done(new Error(q +
          ' was found in statsPerSlide but not in the questions array'));
      }
    });
  });

  //everything ok
  done();
});

// first check if presentation has a live session
// we want this to execute serial before we start
// deleting stuff
slideshowSchema.pre('remove', function checkLiveOnRemove(next) {
  var Session = db.model('Session');
  Session.findOne({
    slides  : this._id,
    endDate : null
  }, null, null,  function(err, session) {
    if (err) { next(err); }
    else if (session) {
      return next(new Error(
        'This presentation is being broadcast and cannot be removed.'));
    }
    next();
  });
});

//remove sessions before removing a slideshow
slideshowSchema.pre('remove', true, function removeSessionOnRemove(next, done) {
  next();
  this.removeSessions()
    .then(function(){ return done();})
    .catch(function(err){ return done(err);});
});

//remove questions before removing a slideshow
// questions will remove the related answers in their own pre()
slideshowSchema.pre('remove', true, function removeQuesOnRemove(next,done) {
  next();
  this.removeQuestions()
    .then(function(){ return done();})
    .catch(function(err){ return done(err);});
});

// removes all the question of a slideshow from the database
slideshowSchema.methods.removeSessions = function(){
  var Session = db.model('Session');

  // we do not call remove on the model but on
  // an instance so that the middleware will run
  return Promise.resolve(Session.find({ slides : this._id}).exec())
  .map(function(session){
    return Promise.promisify(session.remove, session)(); 
  });
} 

// removes all the question of a slideshow from the database
slideshowSchema.methods.removeQuestions = function(){
  // we do not call remove on the model but on
  // an instance so that the middleware will run
  return Promise.resolve(Question.find({_id : {$in : this.questions}}).exec())
  .map(function(question){
    return Promise.promisify(question.remove, question)(); 
  });
} 

// Adds an array of questionIDs to the slideshow
// Array arr should be populated with questionIDs
slideshowSchema.methods.addQuestions = function(arr, cb) {
  return this.update({$addToSet: {questions: {$each: arr}}});
}

// gets all the questions for a specific slide html id
slideshowSchema.methods.getQuestionsForSlide = function(slideHtmlId) {
  for (var i=0; i < this.questionsPerSlide.length; i++) {
    if (this.questionsPerSlide[i].slideHtmlId === slideHtmlId) {
      return this.questionsPerSlide[i].questions;
    }
  }
  return [];
}

// gets all the questions used for stats for a specific slide html id
slideshowSchema.methods.getStatQuestionsForSlide = function(slideHtmlId) {

  for (var i=0; i < this.statsPerSlide.length; i++) {
    if (this.statsPerSlide[i].slideHtmlId === slideHtmlId) {
      return this.statsPerSlide[i].statQuestions;
    }
  }
  return [];
}

// saves object and returns a promise
slideshowSchema.methods.saveWithPromise = function() {
  //we cant use mongoose promises because the
  // save operation returns undefined
  // see here: https://github.com/LearnBoost/mongoose/issues/1431
  // so we construct our own promise
  // to maintain code readability

  var deferred = when.defer();
  this.save(function(err, doc) {
    if (err) {
      deferred.reject(err);
      return;
    }
    deferred.resolve(doc);
  });

  return deferred.promise;
}

slideshowSchema.methods.setQuestionsPerSlide = function(questions) {
  var qPerSlidesObj = {};
  var i, max;
  for (i = 0, max = questions.length; i < max; i++) {
    if (! qPerSlidesObj[questions[i].slideHtmlId]) {
      qPerSlidesObj[questions[i].slideHtmlId] = [];
    }
    qPerSlidesObj[questions[i].slideHtmlId].push(questions[i].id)
  }

  //convert to array
  var qPerSlidesArray = [];
  for (var key in qPerSlidesObj) {
    qPerSlidesArray.push({ slideHtmlId : key, questions : qPerSlidesObj[key] });
  }
  this.questionsPerSlide = qPerSlidesArray;
}

slideshowSchema.methods.setStatsPerSlide =  function(statsForQuestions) {
  var sPerSlidesObj = {};
  var i, max;
  for (i = 0, max = statsForQuestions.length; i < max; i++) {
    if (! sPerSlidesObj[statsForQuestions[i].slideHtmlId]) {
      sPerSlidesObj[statsForQuestions[i].slideHtmlId] = [];
    }
    sPerSlidesObj[statsForQuestions[i].slideHtmlId]
      .push(statsForQuestions[i].questionId)
  }

  //convert to array
  var sPerSlidesArray = [];
  for (var key in sPerSlidesObj) {
    sPerSlidesArray.push({
      slideHtmlId   : key,
      statQuestions : sPerSlidesObj[key]
    });
  }
  this.statsPerSlide = sPerSlidesArray;
}

appLogger.debug('Loading Slideshow model');
mongoose.model('Slideshow', slideshowSchema);

module.exports = mongoose.model('Slideshow');