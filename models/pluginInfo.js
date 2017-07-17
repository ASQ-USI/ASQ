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
    session : { type: ObjectId, ref: 'Session', required: true },
    data : { type: Object }
});

// function to save a plugin's session data
pluginInfoSchema.methods.savePluginSessionData = function(pluginName, sessionId, payload){
  this.db.model('PluginData').create({
    name: pluginName,
    type: 'session',
    session: sessionId,
    data: payload
  })
};

logger.debug('Loading plugins model');
mongoose.model('PluginInfo', pluginInfoSchema, 'pluginInfos');

module.exports = mongoose.model('PluginInfo');
