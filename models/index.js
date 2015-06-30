/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  assessmentModel         : require('./assessment'),
  answerProgressModel     : require('./answerProgress'),
  answerModel             : require('./answer'),
  settingModel            : require('./setting'),
  exerciseModel           : require('./exercise'),
  exerciseSubmissionModel : require('./exerciseSubmission'),
  questionModel           : require('./question'),
  rubricModel             : require('./rubric'),
  userModel               : require('./user'),
  slideshowModel          : require('./slideshow'),
  sessionModel            : require('./session'),
  whitelistModel          : require('./whitelist'),
  pluginModel             : require('./Plugin'),
};