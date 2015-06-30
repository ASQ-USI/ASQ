/**
 * @module models/plugin
 * @description the Plugin Model
*/

'use strict';

var mongoose   = require('mongoose')
var Schema     = mongoose.Schema;
var ObjectId   = Schema.ObjectId;
var logger     = require('logger-asq');
var defaultSettings;

var pluginSchema = new Schema({
    name        : { type: String , unique : true, required : true, dropDups: true },
    description : { type: String },
    version : { type: String, required : true,  default: '0.0.0'},
    isActive    : { type: Boolean, required : true, default: false},
    isInstalled : { type: Boolean, required : true, default: false},
    type        : { type: {}, required : true, default: 'generic'},
    createdAt   : { type: Date, default: Date.now },
    createdBy   : { type: ObjectId, ref: 'User' },
    updatedAt   : { type: Date, default: Date.now },
    updatedBy   : { type: ObjectId, ref: 'User' }
});

logger.debug('Loading plugins model');
mongoose.model('Plugin', pluginSchema);

module.exports = mongoose.model('Plugin');