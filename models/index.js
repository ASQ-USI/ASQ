/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  answerModel     : require('./answer'),
  assessmentModel : require('./assessment'),
  questionModel   : require('./question'),
  sessionModel    : require('./session'),
  slideshowModel  : require('./slideshow'),
  userModel       : require('./user'),
  whitelistModel  : require('./whitelist')
};