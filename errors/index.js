/** 
 * @module errors/index.js 
 * @description Exposes custom error types and helper functions
*/
//adopted from Ghost https://github.com/TryGhost/Ghost/

'use strict'

var BadRequestError     = require('./BadRequestError');
var InternalServerError = require('./InternalServerError');
var NotFoundError       = require('./NotFoundError');
var InvalidSettingError = require('./InvalidSettingError');

module.exports.BadRequestError      = BadRequestError;
module.exports.InternalServerError  = InternalServerError;
module.exports.NotFoundError        = NotFoundError;
module.exports.InvalidSettingError  = InvalidSettingError;
