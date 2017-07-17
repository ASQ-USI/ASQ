/**
 * @module models/pluginInfo
 * @description the mode for additional information created by plugins
*/

'use strict';

const logger = require('logger-asq');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const pluginInfoSchema = new Schema({
    pluginName : { type: String, required: true },
    type : { type: String, required: true },
    session : { type: ObjectId, ref: 'Session' },
    presentation: { type: ObjectId, ref: 'Slideshow' },
    data : { type: Object }
});

logger.debug('Loading plugins model');
mongoose.model('PluginInfo', pluginInfoSchema, 'pluginInfos');

module.exports = mongoose.model('PluginInfo');
