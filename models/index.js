/** @module models/index
    @description Exposes modules under models
*/

module.exports = {
  answerModel     : require('./answer'),
  questionModel   : require('./question'),
  sessionModel    : require('./session'),
  slideshowModel  : require('./slideshow'),
  userModel       : require('./user'),
  whitelistModel  : require('./whitelist')
}