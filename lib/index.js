/** @module lib/index
    @description Exposes modules under lib
*/
module.exports = {
	authentication : require('./authentication'),
  dustHelpers    : require('./dust-helpers'),
  errorMessages  : require('./error-messages'),
  forms          : require('./forms'),
  keywords       : require('./keywords'),
	logger         : require('./logger'),
  passport       : require('./passport'),
	sockets        : require('./sockets'),
	utils          : require('./utils')
}
