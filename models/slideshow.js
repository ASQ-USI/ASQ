/** @module models/slideshow
    @description the Slideshow Model
*/

var mongoose   = require('mongoose');
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var when       = require('when');
var path       = require('path');
var Promise    = require("bluebird");
var coroutine  = Promise.coroutine;
var logger     = require('logger-asq');
var Question   = db.model('Question');
var Setting    = db.model('Setting');
var Exercises  = db.model('Exercise');
var User       = db.model('User');
var config = require('../config');
var assessmentTypes = require('./assessmentTypes.js');
var slideflowTypes = require('./slideflowTypes.js') ;



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
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  exercises         : { type: [{ type: ObjectId, ref: 'Exercise' }], default: [] },
  questionsPerSlide : { type: Schema.Types.Mixed, default: {} },
  exercisesPerSlide : { type: Schema.Types.Mixed, default: {} },
  statsPerSlide     : { type: [statsPerSlideSchema] },
  links             : { type: Array, default: [] },
  lastSession       : { type: Date, default: null },
  lastEdit          : { type: Date, default: Date.now },
  settings          : { type: [{ type: ObjectId, ref: 'Setting' }], default: [] },
});


//get the path of the slideshow. Usefull to server static files
slideshowSchema.virtual('path').get(function() {
  return path.join(config.uploadDir, this._id.toString());
});

//get the path of the slideshow. Usefull to server static files
slideshowSchema.virtual('asqFilePath').get(function() {
  return path.join(config.uploadDir, this._id.toString(), this.asqFile);
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
    if (Object.keys(questionsPerSlide).length === 0) {
      //mo questions no questionsPerSlide, we're ok
      return done();
    } else {
      return done(new Error(
        'There are no questions so questionsPerSlide.length should equal 0'));
    }
  }

  // or maybe we have questions but no questionsPerSlide
  if (Object.keys(questionsPerSlide).length === 0) {
    return done(new Error(
      'There are questions: there must be at least a slide with a question.'));
  }


  //check if all questionsPerSlide are  present in the questions array
  var totalQuestions = [];

  Object.keys(questionsPerSlide).forEach(function (key) {
    questionsPerSlide[key].forEach(function(q) {

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

// removes all the sessions of a slideshow from the database
slideshowSchema.methods.removeSessions = coroutine(function *removeSessionsGen(){
  var Session = db.model('Session');

  // we do not call remove on the model but on
  // an instance so that the middleware will run
  yield Promise.map(
    Session.find({ slides : this._id}).exec(), function(session){
      return session.remove(); 
  });

  this.lastSession = null;
  return this.save();
}); 

// removes all the questions of a slideshow from the database
slideshowSchema.methods.removeQuestions =  coroutine(function *removeQuestionsGen(){
  // we do not call remove on the model but on
  // an instance so that the middleware will run
  yield Promise.map(
    Question.find({_id : {$in : this.questions}}).exec(), function(question){
      return question.remove(); 
  });

  this.questions = [];
  this.questionsPerSlide = {};
  this.markModified("questionsPerSlide")
  return this.save();
});

// removes all the exercises of a slideshow from the database
slideshowSchema.methods.removeExercises =  coroutine(function *removeExercisesGen(){
  // we do not call remove on the model but on
  // an instance so that the middleware will run
  yield Promise.map(
    Exercises.find({_id : {$in : this.exercises}}).exec(), function(exercise){
      return exercise.remove(); 
  });

  this.exercises = [];
  this.exercisesPerSlide = {};
  this.markModified("exercisesPerSlide")
  return this.save();
});

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

slideshowSchema.methods.getSettings = coroutine(function* getSettingsGen() {
  var settings = [];
  for ( var i=0; i<this.settings.length; i++ ) {
    var tmp = yield Setting.findById(this.settings[i]).exec();
    settings.push(tmp);
  }
  return settings;
});


logger.debug('Loading Slideshow model');

mongoose.model('Slideshow', slideshowSchema);

module.exports = mongoose.model('Slideshow');