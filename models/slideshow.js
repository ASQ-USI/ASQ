/** @module models/slideshow
    @description the Slideshow Model
*/

'use strict';

const logger = require('logger-asq');
var _ = require('lodash');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
const path = require('path');
const Promise = require('bluebird');
const coroutine = Promise.coroutine;
const Question = db.model('Question');

const Exercises = db.model('Exercise');
const User = db.model('User');
const config = require('../config');
const assessmentTypes = require('./assessmentTypes.js');
const slideflowTypes = require('./slideflowTypes.js') ;


const presentationSettingSchema = require('./presentationSetting.js');

const questionsPerSlideSchema = new Schema({
  slideHtmlId : { type: String, required: true },
  questions   : { type: [{ type: ObjectId, ref: 'Question' }], required: true }
}, { _id: false });

const statsPerSlideSchema = new Schema({
  slideHtmlId   : { type: String, required: true },
  statQuestions : { type: [{ type: ObjectId, ref: 'Question'}], required: true }
}, { _id: false });

const slideshowSchema = new Schema({
  title             : { type: String, required: true },
  course            : { type: String, required: true, default: 'General' },
  originalFile      : { type: String, default: '' },
  asqFile           : { type: String, default: '' },
  presenterFile     : { type: String, default: '' },
  viewerFile        : { type: String, default: '' },
  owner             : { type: ObjectId, ref: 'User', required: true },
  presentationFramework : {
                            type: String,
                            default: 'impress.js',
                            enum: ['impress.js', 'reveal.js']
                          },
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
  settings          : [ presentationSettingSchema ],
  pdfFile           : { type: String, default: ''},
  conversionStatus  : { type: String,
                        default: 'not_started',
                        enum: ['not_started', 'done', 'converting_pdf_to_html', 'injecting_questions']}
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

  if (this.questions.length === 0) { return done(); }
  
  Question.find({_id : {$in: this.questions}}, (err, questions) => {
    if (err) { done(err); }

    else if (questions.length !== this.questions.length) {
      let err = new Error(
        'All question items should have a real Question _id');
      logger.error({
            err: err,
            'presentation_id': this._id,
            'questions_length': questions.length,
            'this_questions_length': this.questions.length,
          }, 'error on saving presentation');
      return done(err);
    }
    done();
  });
});

//check if questionsPerSlide are valid
slideshowSchema.pre('save', true, function checkQuesPerSlideOnSave(next, done) {
  next();

  const questions = this.questions;
  const questionsPerSlide =  this.questionsPerSlide;

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

  const questions     = this.questions;
  const statsPerSlide =  this.statsPerSlide;

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
  const Session = db.model('Session');
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
  this.markModified('questionsPerSlide')
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
  this.markModified('exercisesPerSlide')
  return this.save();
});

// Adds an array of questionIDs to the slideshow
// Array arr should be populated with questionIDs
slideshowSchema.methods.addQuestions = function(arr, cb) {
  return this.update({$addToSet: {questions: {$each: arr}}});
}

// gets all the questions for a specific slide html id
slideshowSchema.methods.getQuestionsForSlide = function(slideHtmlId) {
  for (let i=0; i < this.questionsPerSlide.length; i++) {
    if (this.questionsPerSlide[i].slideHtmlId === slideHtmlId) {
      return this.questionsPerSlide[i].questions;
    }
  }
  return [];
}

// gets all the questions used for stats for a specific slide html id
slideshowSchema.methods.getStatQuestionsForSlide = function(slideHtmlId) {

  for (let i=0; i < this.statsPerSlide.length; i++) {
    if (this.statsPerSlide[i].slideHtmlId === slideHtmlId) {
      return this.statsPerSlide[i].statQuestions;
    }
  }
  return [];
}

slideshowSchema.methods.setQuestionsPerSlide = function(questions) {
  const qPerSlidesObj = {};
  let i, max;
  for (i = 0, max = questions.length; i < max; i++) {
    if (! qPerSlidesObj[questions[i].slideHtmlId]) {
      qPerSlidesObj[questions[i].slideHtmlId] = [];
    }
    qPerSlidesObj[questions[i].slideHtmlId].push(questions[i].id)
  }

  //convert to array
  const qPerSlidesArray = [];
  for (let key in qPerSlidesObj) {
    qPerSlidesArray.push({ slideHtmlId : key, questions : qPerSlidesObj[key] });
  }
  this.questionsPerSlide = qPerSlidesArray;
}

slideshowSchema.methods.setStatsPerSlide =  function(statsForQuestions) {
  const sPerSlidesObj = {};
  let i, max;
  for (i = 0, max = statsForQuestions.length; i < max; i++) {
    if (! sPerSlidesObj[statsForQuestions[i].slideHtmlId]) {
      sPerSlidesObj[statsForQuestions[i].slideHtmlId] = [];
    }
    sPerSlidesObj[statsForQuestions[i].slideHtmlId]
      .push(statsForQuestions[i].questionId)
  }

  //convert to array
  const sPerSlidesArray = [];
  for (let key in sPerSlidesObj) {
    sPerSlidesArray.push({
      slideHtmlId   : key,
      statQuestions : sPerSlidesObj[key]
    });
  }
  this.statsPerSlide = sPerSlidesArray;
}

slideshowSchema.methods.listSettings = function() {
  return this.settings.toObject()
}

slideshowSchema.methods.readSetting = function(key) {
  const settings = this.settings.toObject();
  for ( let i in settings ) {
    if ( settings[i].key === key ) {
      return settings[i].value
    }
  }

  throw 'Key not found';
}

slideshowSchema.methods.updateSetting = coroutine(function* updateSettingsGen(setting) {
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

slideshowSchema.methods.updateSettings = coroutine(function* updateSettingsGen(settings) {
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

logger.debug('Loading Slideshow model');

mongoose.model('Slideshow', slideshowSchema);

module.exports = mongoose.model('Slideshow');