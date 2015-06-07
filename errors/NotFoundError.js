/** 
 * @module errors/NotFoundError.js 
 * @description Not found error
 * Custom error class with status code and type prefilled.
*/
//taken from Ghost https://github.com/TryGhost/Ghost/

'use strict';

function NotFoundError(message) {
    this.message = message;
    this.stack = new Error().stack;
    this.code = 404;
    this.errorType = this.name;
}

NotFoundError.prototype = Object.create(Error.prototype);
NotFoundError.prototype.name = 'NotFoundError';

module.exports = NotFoundError;