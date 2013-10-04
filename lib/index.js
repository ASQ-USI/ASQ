/** @module lib/index
    @description Exposes modules under lib
*/
module.exports = {
  assessment     : require('./assessment'),
	authentication : require('./authentication'),
  errorMessages  : require('./error-messages'),
  dustHelpers    : require('./dust-helpers'),
  keywords       : require('./keywords'),
	logger         : require('./logger'),
  passport       : require('./passport'),
	sockets        : require('./sockets'),
	utils          : require('./utils')
}
