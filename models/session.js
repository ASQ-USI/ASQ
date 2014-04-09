/** @module models/session
    @description the Session Model
*/

var mongoose = require('mongoose')
, Schema     = mongoose.Schema
, ObjectId   = Schema.ObjectId
, when       = require('when')
, appLogger  = require('../lib/logger').appLogger;


var sessionSchema = new Schema({
	presenter: { type: ObjectId, ref: 'User'},
	slides: { type: ObjectId, ref: 'Slideshow' },
  authLevel: { type: String, default: 'public', enum: ['public', 'anonymous', 'private'] },
	activeSlide: { type: String, default: '0' },
	startDate: {type: Date, default: Date.now },
  endDate: { type: Date, default: null },
	viewers: {type: Array, default: []},

	answers: { type:[ObjectId], ref: 'Answer'},
	showingQuestion: { type: Boolean, default: false}, //maybe don't need it -> used to get a new connection up to date if it connects un the middle of a session
	showingAnswer: { type: Boolean, default: false}, //maybe don't need it -> same as above
	started: { type: Boolean, default: false},
	questionsDisplayed: { type: [ObjectId], ref: 'Question'}, //maybe don't need it
  activeQuestions: [ObjectId],
  activeStatsQuestions : [ObjectId]
});

sessionSchema.virtual('isTerminated').get(function() {
  return this.endDate !== null;
});

//we do not allow more than one live session for the same user and the same slideshow
sessionSchema.pre('save', true, function(next, done){
  next();
  var Session = db.model('Session');
  Session.findOne({
    _id : {$ne: this._id},
    presenter: this.presenter,
    slides: this.slides,
    endDate: null,
  }, function(err, session) {
    if(err) done(err);
    if (session) {
      return done(new Error('A live session with the specified user and presentation already exists'));
    }
    done();
  });
});

//slideshow should exist
sessionSchema.pre('save', true, function(next, done){
  next();
  var Slideshow = db.model('Slideshow');
  Slideshow.findOne({_id : this.slides}, function(err, slideshow) {
    if(err) done(err)
    if (!slideshow) {
      return done(new Error('Slides field must be a real Slideshow _id'));
    }
    done();
  });
});

//presenter should exist
sessionSchema.pre('save', true, function(next, done){
  next();
  var User = db.model('User');
  User.findOne({_id : this.presenter}, function(err, presenter) {
    if(err) done(err)
    if (!presenter) {
      return done(new Error('Presenter field must be a real User _id'));
    }
    done();
  });
});

sessionSchema.statics.getLiveSessions = function getLiveSessions(userId, callback) {
  var deferred = when.defer();
  this.find({ presenter: userId, endDate: null},
  function onLiveSessions(err, sessions) {
    if (callback & (typeof(callback) == "function")) {
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

sessionSchema.statics.getLiveSessionIds = function getLiveSessionIds(userId, callback) {
  var deferred = when.defer();
  this.find({ presenter: userId, endDate: null}, '_id',
  function onLiveSessions(err, sessions) {
    if (callback & (typeof(callback) == "function")) {
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

  var deferred = when.defer()
  , Slideshow = db.model('Slideshow');

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

  var deferred = when.defer()
  , Slideshow = db.model('Slideshow');

  Slideshow.findById(this.slides).exec()
    .then(function(slideshow){
      deferred.resolve(slideshow.getStatQuestionsForSlide(slideHtmlId));
    }
   ,function(err, slideshow) {
      throw err;  
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
        if(questions[i]== questionId){
           deferred.resolve(true);
        }
      }
      deferred.resolve(false);
    })
  return deferred.promise;
}

// sessionSchema.methods.question = function(callback) {
// 	var that = this;
// 	var Slideshow = db.model('Slideshow');
// 	Slideshow.findById(this.slides, function(err, slideshow) {
// 		if (slideshow) {
// 			var Question = db.model('Question');
// 		Question.findOne({$and: [ {_id: { $in: slideshow.questions }}, {_id: {$nin: that.questionsDisplayed}}],
// 						afterslide: that.activeSlide},
// 				        function(err, question) {
// 							console.log('question');
// 							console.log(question);
// 							console.log(that.activeSlide);
// 							callback(err, question);
// 						});
// 		}
		
// 	});
// }

sessionSchema.set('toObject', { virtuals: true });
sessionSchema.set('toJSON', { virtuals: true });

appLogger.debug('Loading Session model');
mongoose.model("Session", sessionSchema);

module.exports = {
  sessionSchema : sessionSchema
}
