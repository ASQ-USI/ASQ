/** 
 * @module errors/InvalidSettingError.js 
 * @description Bad Request error
 * Custom error class with status code and type prefilled.
*/


'use strict';

function InvalidSettingError(key) {
    this.message = 'InvalidSettingError: setting `' + key + '` has invalid value.';
    this.key = key;
    this.stack = new Error().stack;
    this.errorType = this.name;
}

InvalidSettingError.prototype = Object.create(Error.prototype);
InvalidSettingError.prototype.name = 'InvalidSettingError';

module.exports = InvalidSettingError;
