/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  answerModel     : require('./answer'),
  assessmentModel : require('./assessment'),
  questionModel   : require('./question'),
  rubricModel     : require('./rubric'),
  userModel       : require('./user'),
  slideshowModel  : require('./slideshow'),
  sessionModel    : require('./session'),
  whitelistModel  : require('./whitelist')
};