/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  answerProgressModel : require('./answerProgress'),
  assessmentModel     : require('./assessment'),
  answerModel         : require('./answer'),
  exerciseModel       : require('./exercise'),
  questionModel       : require('./question'),
  rubricModel         : require('./rubric'),
  userModel           : require('./user'),
  slideshowModel      : require('./slideshow'),
  sessionModel        : require('./session'),
  whitelistModel      : require('./whitelist')
};