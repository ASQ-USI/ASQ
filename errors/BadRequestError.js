/** 
 * @module errors/BadRequestError.js 
 * @description Bad Request error
 * Custom error class with status code and type prefilled.
*/
//taken from Ghost https://github.com/TryGhost/Ghost/

'use strict';

function BadRequestError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.code = 400;
    this.errorType = this.name;
}

BadRequestError.prototype = Object.create(Error.prototype);
BadRequestError.prototype.name = 'BadRequestError';

module.exports = BadRequestError;
