/**
 * @module models/question
 * @description the Questions Model
 **/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const Answer = db.model('Answer');
const abstractQuestionSchema = require('./abstractQuestionSchema');
const assessmentTypes = require('./assessmentTypes');
const logger = require('logger-asq');
const Promise = require("bluebird");
const coroutine = Promise.coroutine;
const _ = require('lodash');
const presentationSettingSchema = require('./presentationSetting.js');

const questionOptionSchema = new Schema({
  text      : { type: String, required: true },
  classList : { type: String, required: true, default: '' },
  correct   : { type: Boolean, required: true }
}, { _id: false }); //Prevent creation of id for subdocuments.

// const questionSchema = abstractQuestionSchema.extend({
//   body            : {type: String, default: ''},
//   questionOptions : { type: [questionOptionSchema] },
//   correctAnswer   : { type: String },
//   assessment      : { type: [{ type: String, enum: assessmentTypes }],
//                       default: [] }
// });

const questionSchema = new Schema({
  // TODO: enum questionTypes
  type : { type: String, required: true },
  author : { type: ObjectId, ref: 'User', required: false },
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
	const result = [];
	if (this.questionType === 'multi-choice') {
    let i, max;
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

questionSchema.methods.listSettings = function() {
  return this.settings.toObject()
}

questionSchema.methods.readSetting = function(key) {
  const settings = this.settings.toObject();
  for ( let i in settings ) {
    if ( settings[i].key === key ) {
      return settings[i].value
    }
  }

  throw 'Key not found';
}


questionSchema.methods.updateSetting = coroutine(function* updateSettingsGen(setting) {
  for ( let i in this.settings.toObject() ) {
    const key = this.settings[i].key;
    if ( setting.key === key ) {
      if ( this.settings[i].value !== setting.value ) {
        const old = this.settings[i].value;
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
  const flatten = {}
  if ( _.isArray(settings) ) {
    settings.forEach(function(setting) {
      flatten[setting.key] = setting.value;
    });
  } else {
    flatten = settings;
  }


  if ( this.settings.toObject().length > 0) {
    for ( let i in this.settings.toObject() ) {
      const key = this.settings[i].key;
      if ( flatten.hasOwnProperty(key) ) {
        if ( this.settings[i].value !== flatten[key] ) {
          this.settings[i].value = flatten[key];
        }
      }
    }
  } else {
    this.settings = settings;
  }

  yield this.save();
})


logger.debug('Loading Question model');
mongoose.model('Question', questionSchema, 'questions');

module.exports =  mongoose.model('Question');