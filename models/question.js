/**
 * @module models/question
 * @description the Questions Model
 **/

var mongoose             = require('mongoose')
, Schema                 = mongoose.Schema
, when                   = require('when')
, wkeys                  = require('when/keys')
, Answer                 = db.model('Answer')
, abstractQuestionSchema = require('./abstractQuestion')
, questionOptionSchema   = require('./questionOption')
, stats                  = require('../lib/stats')
, appLogger              = require('../lib/logger').appLogger;

var questionSchema = abstractQuestionSchema.extend({
  questionOptions : { type: [questionOptionSchema] },
  correctAnswer   : { type: String },
});

//remove answers before removing a question
// Do we really want to do this?
questionSchema.pre('remove', true, function preRemoveHook(next,done) {
  next();

  //delete sessions
  Answer.remove({question : this.id}, function onAnswerRemoval(err) {
    if (err) { done(err); }
    done();
  });
});

//Returns array with solution
questionSchema.methods.getSolution = function(){
			var result = [];
			if (this.questionType === 'multi-choice') {
        var i, max;
				for (i = 0, max =this.questionOptions.length; i <  max; i++) {
			  		result.push(this.questionOptions[i].correct);
				}
			} else if (this.correctAnswer) {
				result.push(this.correctAnswer);
			} else {
        //FIXME: is this ok?
        result = null;
      }
      appLogger.debug('Solution for question ' + this.stem);
      appLogger.debug(result);
			return result;
}

questionSchema.methods.getStats = function getStats(sessionId) {
  var o = {};
  for(var i = this.statTypes.length; i--;) {
    o[this.statTypes[i]] = stats[this.statTypes[i]](this._id, sessionId);
  }
  return wkeys.all(o);
}

appLogger.debug('Loading Question model');
mongoose.model('Question', questionSchema, 'questions');

var create =  function(docs){
  //we cant use mongoose promises because the
  // save operation returns undefined
  // see here: https://github.com/LearnBoost/mongoose/issues/1431
  // so we construct our own promise
  // to maintain code readability

  var deferred = when.defer()
  , Question = db.model('Question');

  Question.create(docs, function(err){
    if (err) {
      deferred.reject(err);
      return;
    }

    // aggregate saved docs
    var docs = [];
    for (var i=1; i<arguments.length; ++i) {
        docs.push(arguments[i]);
    }
    deferred.resolve(docs);
  });

  return deferred.promise;
}

module.exports =  {
  questionSchema          : questionSchema,
  questionOptionSchema    : questionOptionSchema,
  create                  : create
}