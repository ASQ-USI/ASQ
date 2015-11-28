/** @module lib/model/pubsub
    @description an eventEmitter to facilitate communication between
    for model events
*/

'use strict'
var EventEmitter2 = require('eventemitter2').EventEmitter2;
module.exports = new EventEmitter2();
