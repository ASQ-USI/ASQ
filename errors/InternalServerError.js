/** 
 * @module errors/InternalServerError.js 
 * @description Internal Server Error
 * Custom error class with status code and type prefilled.
*/
//taken from Ghost https://github.com/TryGhost/Ghost/

'use strict';

function InternalServerError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.code = 500;
    this.errorType = this.name;
}

InternalServerError.prototype = Object.create(Error.prototype);
InternalServerError.prototype.name = 'InternalServerError';

module.exports = InternalServerError;
