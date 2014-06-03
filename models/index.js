/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  assessmentModel     : require('./assessment'),
  answerProgressModel : require('./answerProgress'),
  answerModel         : require('./answer'),
  exerciseModel       : require('./exercise'),
  questionModel       : require('./question'),
  rubricModel         : require('./rubric'),
  userModel           : require('./user'),
  slideshowModel      : require('./slideshow'),
  sessionModel        : require('./session'),
  whitelistModel      : require('./whitelist')
};