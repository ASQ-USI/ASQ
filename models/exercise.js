/**
 * @module models/exercise
 * @description the Exercise Model
 **/


var mongoose         = require('mongoose');
var Schema           = mongoose.Schema;
var ObjectId         = Schema.ObjectId;
var Promise          = require("bluebird");
var coroutine        = Promise.coroutine;
var assessmentTypes  = require('./assessmentTypes');
var logger           = require('logger-asq');
var PresentationSetting          = db.model('PresentationSetting');


var exerciseSchema = new Schema({
  questions         : { type: [{ type: ObjectId, ref: 'Question' }], default: [] },
  settings          : { type: [{ type: ObjectId, ref: 'PresentationSetting' }], default: [] },
});


exerciseSchema.methods.listSettings = coroutine(function* listSettingsGen() {
  return yield PresentationSetting.find({_id: {$in: this.settings}}).exec();
});

exerciseSchema.methods.readSetting = coroutine(function* readSettingGen(key) {
  var query = {
    $and: [ 
      {_id: {$in: this.settings}},
      {key: key}
    ]
  };
  var settings = yield PresentationSetting.find(query).exec();
  if ( settings[0] ) {
    return settings[0].value
  }

  return Promise.reject(new errors.NotFoundError('Setting not found.'));
});

logger.debug('Loading Exercise model');

mongoose.model('Exercise', exerciseSchema);
module.exports = mongoose.model('Exercise');
