/** @module models/index
    @description Exposes modules under models
*/

// Order is important here!!

module.exports = {
  sessionEventModel       : require('./sessionEvent'),
  assessmentModel         : require('./assessment'),
  answerProgressModel     : require('./answerProgress'),
  answerModel             : require('./answer'),
  settingModel            : require('./setting'),
  presentationSettingModel : require('./presentationSetting'),
  exerciseModel           : require('./exercise'),
  exerciseSubmissionModel : require('./exerciseSubmission'),
  questionModel           : require('./question'),
  rubricModel             : require('./rubric'),
  userModel               : require('./user'),
  slideshowModel          : require('./slideshow'),
  sessionModel            : require('./session'),
  whitelistModel          : require('./whitelist'),
  pluginModel             : require('./plugin')
};