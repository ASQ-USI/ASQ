/**
 * @module models/exercise
 * @description the Exercise Model
 **/

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;
var Promise = require("bluebird");
var coroutine  = Promise.coroutine;
var assessmentTypes  = require('./assessmentTypes');
var logger = require('logger-asq');
var Setting = db.model('Setting');

var exerciseSchema = new Schema({
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  settings          : { type: [{ type: ObjectId, ref: 'Setting' }], default: [] },
});


// exerciseSchema.virtual('allowResubmit').get(coroutine(function* allowResubmitGen() {
//   var max = yield this.getSetting('maxNumSubmissions');

//   // max < 0 means infinite submissions allowed
//   if( max < 0) return Promise.resolve(true);

//   var count = yield ExerciseSubmission.where({
//     'exercise': submission.exerciseUid,
//     'answeree': submission.answeree,
//     'session' : submission.session,
//   }).count();

//   return Promise.resolve(count < max);
// }));
// 
exerciseSchema.virtual('allowResubmit').get(function allowResubmit(){
  return true;
});

exerciseSchema.set('toObject', { virtuals: true });
exerciseSchema.set('toJSON', { virtuals: true });

exerciseSchema.methods.getSettings = coroutine(function* getSettingsGen() {
  var settings = [];
  for ( var i=0; i<this.settings.length; i++ ) {
    var tmp = yield Setting.findById(this.settings[i]).exec();
    settings.push(tmp);
  }
  return settings;
});

exerciseSchema.methods.getSetting = coroutine(function* getSetttingGen(key) {
  for ( var i=0; i<this.settings.length; i++ ) {
    var setting = yield Setting.findById(this.settings[i]).exec();
    if ( setting.key === key ) {
      return setting.value;
    }
  }
});

logger.debug('Loading Exercise model');
mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
