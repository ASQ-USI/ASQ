/**
 * @module models/question
 * @description the Questions Model
 **/

var mongoose             = require('mongoose')
, Schema                 = mongoose.Schema
, when                   = require('when')
, wkeys                  = require('when/keys')
, Answer                 = db.model('Answer')
, abstractQuestionSchema = require('./abstractQuestionSchema')
, assessmentTypes        = require('./assessmentTypes')
, stats                  = require('../lib/stats')
, appLogger              = require('../lib/logger').appLogger;

var questionOptionSchema = new Schema({
  text      : { type: String, required: true },
  classList : { type: String, required: true, default: '' },
  correct   : { type: Boolean, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

var questionSchema = abstractQuestionSchema.extend({
  body            : {type: String, default: ''},
  questionOptions : { type: [questionOptionSchema] },
  correctAnswer   : { type: String },
  assessment      : { type: [{ type: String, enum: assessmentTypes }],
                      default: [] }
});

var questionSchema = new Schema({
  // TODO: enum questionTypes
  type : { type: String },
  data : {type: Schema.Types.Mixed},
  date_created : {type: Date, default: Date.now()},
  date_modified : {type: Date, default: Date.now()}
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
  // appLogger.debug('Solution for question ' + this.stem);
  // appLogger.debug(result);
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

module.exports =  mongoose.model('Question');