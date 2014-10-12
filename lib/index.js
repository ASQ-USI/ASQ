/** @module lib/index
    @description Exposes modules under lib
*/
module.exports = {
	authentication : require('./authentication'),
	dustHelpers    : require('./dust-helpers'),
	form           : require('./forms'),
	logger         : require('./logger'),
	passport       : require('./passport'),
	statsHandlers  : require('./stats'),
	utils          : require('./utils')
}
