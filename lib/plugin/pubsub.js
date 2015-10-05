/** @module lib/plugin/pubsub
    @description an eventEmitter to facilitate communication between
    plugins and the app in a decoupled way
*/

'use strict'
var EventEmitter2 = require('eventemitter2').EventEmitter2;
module.exports = new EventEmitter2();
