/** @module models/session
    @description the Session Model
*/

var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, ObjectId   = Schema.ObjectId
, when       = require('when')
, appLogger  = require('../lib/logger').appLogger
, User       = db.model('User')
, Slideshow  = db.model('Slideshow');

var sessionSchema = new Schema({
  presenter            : { type: ObjectId, ref: 'User', required: true },
  slides               : { type: ObjectId, ref: 'Slideshow', required: true },
  authLevel            : { type: String, required: true, default: 'public',
                           enum: ['public', 'anonymous', 'private'] },
  activeSlide          : { type: String, required: true, default: '0' },
  startDate            : { type: Date, required: true, default: Date.now },
  endDate              : { type: Date, default: null },
  answers              : { type:[{ type: ObjectId, ref: 'Answer' }],
                           default: [] },
  started              : { type: Boolean, default: false},
  activeQuestions      : { type: [{ type: ObjectId, ref: 'Question' }],
                           default: [] },
  activeStatsQuestions : { type: [{ type: ObjectId, ref: 'Question' }],
                           default: [] }
});

sessionSchema.virtual('isTerminated').get(function() {
  return this.endDate !== null;
});

// Ensure only one session given a presenter and a set of slides.
sessionSchema.index({ presenter: 1, slides: 1 });

//slideshow should exist
sessionSchema.pre('save', true, function checkSlidesOnSave(next, done){
  next();

  Slideshow.findOne({_id : this.slides}, function(err, slideshow) {
    if (err) { done(err); }
    else if (!slideshow) {
      return done(new Error('Slides field must be a real Slideshow _id'));
    }
    done();
  });
});

//presenter should exist
sessionSchema.pre('save', true, function checkPresenterOnSave(next, done){
  next();

  User.findOne({_id : this.presenter}, function(err, presenter) {
    if (err) { done(err); }
    else if (!presenter) {
      return done(new Error('Presenter field must be a real User _id'));
    }
    done();
  });
});

sessionSchema.statics.getLiveSessions = function(userId, callback) {
  var deferred = when.defer();
  this.find({ presenter: userId, endDate: null},
  function onLiveSessions(err, sessions) {
    if (callback & (typeof (callback) === 'function')) {
      callback(err, sessions);
      return
    } else if (err) {
      deferred.reject(err);
    } else {
    deferred.resolve(sessions);
    }
  });
  return deferred.promise;
}

sessionSchema.statics.getLiveSessionIds = function(userId, callback) {
  var deferred = when.defer();
  this.find({ presenter: userId, endDate: null}, '_id',
  function onLiveSessions(err, sessions) {
    if (callback & (typeof (callback) === 'function')) {
      callback(err, sessions);
      return
    } else if (err) {
      deferred.reject(err);
    } else {
    deferred.resolve(sessions);
    }
  });
  return deferred.promise;
}

sessionSchema.methods.questionsForSlide = function(slideHtmlId) {
  var deferred = when.defer();
  Slideshow.findById(this.slides).exec()
    .then(function(slideshow){
      deferred.resolve(slideshow.getQuestionsForSlide(slideHtmlId));
    }
   ,function(err, slideshow) {
      throw err;
  });

  return deferred.promise;
}

sessionSchema.methods.statQuestionsForSlide = function(slideHtmlId) {
  var deferred = when.defer();
  Slideshow.findById(this.slides).exec()
    .then(function(slideshow){
      deferred.resolve(slideshow.getStatQuestionsForSlide(slideHtmlId));
    }
   ,function(err, slideshow) {
      deferred.reject(err);
  });

  return deferred.promise;
}

/**
* @ function isQuestionInSlide
* @description Checks if the questionId is inside a slide
* with an id of slideHtmlId, in the session;
*/
sessionSchema.methods.isQuestionInSlide = function(slideHtmlId, questionId) {
  var deferred = when.defer();
  this.questionsForSlide(slideHtmlId)
    .then(function(questions){
      for (var i=0; i<questions.length; i++){
        if (questions[i]== questionId){
           deferred.resolve(true);
        }
      }
      deferred.resolve(false);
    })
  return deferred.promise;
}

// Export virtual fields as well
sessionSchema.set('toObject', { virtuals: true });
sessionSchema.set('toJSON', { virtuals: true });

appLogger.debug('Loading Session model');
mongoose.model('Session', sessionSchema);

module.exports = mongoose.model('Session');