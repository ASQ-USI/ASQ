/**
 * @module models/pluginCustomData
 * @description the mode for additional information created by plugins
*/

'use strict';

const logger = require('logger-asq');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const pluginCustomDataSchema = new Schema({
    pluginName : { type: String, required: true },
    type : { type: String, required: true },
    session : { type: ObjectId, ref: 'Session' },
    presentation: { type: ObjectId, ref: 'Slideshow' },
    data : { type: Object }
});

logger.debug('Loading plugins model');
mongoose.model('PluginCustomData', pluginCustomDataSchema, 'pluginCustomDatas');

module.exports = mongoose.model('PluginCustomData');
