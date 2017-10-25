/** @module lib/plugin/db
    @description db interface for plugins
*/

'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
const logger = require('logger-asq');


module.exports = {
  model : db.model.bind(db),

  getPresentationQuestionsByType: coroutine(function *getPresentationQuestionsByTypeGen(presentation_id, type){
    if(!type || (''+type).trim().length < 0) throw new Error('Second arg should be a non-empty string');

    var presentation = yield db.model('Slideshow').findById(presentation_id).exec();

    if (!presentation) throw new Error('Presentation with _id: ' + presentation_id.toString() +' does not exist');
    if (presentation.questions.length == 0) return [];

    var questions = yield db.model('Question').find({
      _id : {$in: presentation.questions },
      type : type
    }).lean();

    return questions;
  }),

  savePluginSessionData: coroutine(function *savePluginSessionDataGen(pluginName, sessionId, payload) {
    try {
      var pluginCustomData = yield db.model('PluginCustomData').findOne({
        pluginName: pluginName,
        type: 'session',
        session: sessionId,
      });

      if (pluginCustomData) {
        pluginCustomData.data = payload;
        yield pluginCustomData.save();
      }
      else {
        pluginCustomData = {
          pluginName: pluginName,
          type: 'session',
          session: sessionId,
          data: payload
        };
        yield db.model('PluginCustomData').create(pluginCustomData);
      }
    }
    catch(err){
      console.log(err.stack);

      logger.error({
        err: err,
        pluginName: pluginName,
        session: sessionID,
      }, "error saving pluginCustomData");
    }
  }),

  getPluginSessionData: coroutine(function *getPluginSessionDataGen(pluginName, sessionId) {
      try {
        var pluginCustomData = yield db.model('PluginCustomData').findOne({
          pluginName: pluginName,
          type: 'session',
          session: sessionId,
        }).lean();
        return (pluginCustomData)? pluginCustomData.data : null;
      }
      catch(err){
        console.log(err.stack);

        logger.error({
          err: err,
          pluginName: pluginName,
          session: sessionID,
        }, "error getting pluginCustomData");
      }
  }),

}
