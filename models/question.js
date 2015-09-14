/**
 * @module models/question
 * @description the Questions Model
 **/

var mongoose               = require('mongoose');
var Schema                 = mongoose.Schema;
var ObjectId               = Schema.ObjectId;
var when                   = require('when');
var wkeys                  = require('when/keys');
var Answer                 = db.model('Answer');
var abstractQuestionSchema = require('./abstractQuestionSchema');
var assessmentTypes        = require('./assessmentTypes');
var stats                  = require('../lib/stats');
var logger                 = require('logger-asq');
var Promise                = require("bluebird");
var coroutine              = Promise.coroutine;
var _ = require('lodash');
var presentationSettingSchema = require('./presentationSetting.js');

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
  type : { type: String, required: true },
  data : {type: Schema.Types.Mixed},
  date_created : {type: Date, default: Date.now()},
  date_modified : {type: Date, default: Date.now()},

  settings : [ presentationSettingSchema ]
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
  // logger.debug('Solution for question ' + this.stem);
  // logger.debug(result);
	return result;
}

questionSchema.methods.getStats = function getStats(sessionId) {
  var o = {};
  for(var i = this.statTypes.length; i--;) {
    o[this.statTypes[i]] = stats[this.statTypes[i]](this._id, sessionId);
  }
  return wkeys.all(o);
}

questionSchema.methods.listSettings = function() {
  return this.settings.toObject()
}

questionSchema.methods.readSetting = function(key) {
  var settings = this.settings.toObject();
  for ( var i in settings ) {
    if ( settings[i].key === key ) {
      return settings[i].value
    }
  }

  throw 'Key not found';
}


questionSchema.methods.updateSetting = coroutine(function* updateSettingsGen(setting) {
  for ( var i in this.settings.toObject() ) {
    var key = this.settings[i].key;
    if ( setting.key === key ) {
      if ( this.settings[i].value !== setting.value ) {
        var old = this.settings[i].value;
        this.settings[i].value = setting.value;

        try{
          yield this.save();
        } catch(e){
          console.log('Warning: failed to update settings. Rollback.', e.message);
          this.settings[i].value = old;
          yield this.save();

          throw e;
        }
      }
    }
  }
}),

questionSchema.methods.updateSettings = coroutine(function* updateSettingsGen(settings) {
  var flatten = {}
  if ( _.isArray(settings) ) {
    settings.forEach(function(setting) {
      flatten[setting.key] = setting.value;
    });
  } else {
    flatten = settings;
  }

  var old = {}
  _.clone(this.settings.toObject()).forEach(function(setting) {
    old[setting.key] = setting.value;
  });

  if ( this.settings.length > 0) {
    for ( var i in this.settings.toObject() ) {
      var key = this.settings[i].key;
      if ( flatten.hasOwnProperty(key) ) {
        if ( this.settings[i].value !== flatten[key] ) {
          this.settings[i].value = flatten[key];
        }
      }
    }
  } else {
    this.settings = settings;
  }

  try{
    yield this.save();
  } catch(e){
    console.log('Warning: failed to update settings. Rollback.', e.message);

    // When it was failed to update settings,
    // it is necessary to revert the original
    // valid settings.
    for ( var i in this.settings.toObject() ) {
      var key = this.settings[i].key;
      this.settings[i].value = old[key];
    }
    
    try {
      yield this.save();
    } catch (e) {
      console.error('Error: failed to revert original settings.', e.message);
      throw 'Error: failed to revert original settings.'
      return
    }

    // After reverting, throw the exception 
    // so that the caller is able to know 
    // there was an exception when saving.
    throw e
  }
})


logger.debug('Loading Question model');
mongoose.model('Question', questionSchema, 'questions');

module.exports =  mongoose.model('Question');