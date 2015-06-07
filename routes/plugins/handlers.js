/** @module routes/plugins/handlers
    @description handlers for /plugin/
*/
'use strict';

var Promise = require('bluebird');
var coroutine = Promise.coroutine;
var lib = require('../../lib');
var logger = lib.logger.appLogger;
var plugins = require('../../lib/plugin');

module.exports = {

  postInstall: coroutine(function *postInstallGen(req, res, next) {
    var pluginName = req.params.pluginName;
    try{
      var plugin = yield plugins.installPlugin(pluginName);

      logger.log({
        user_id: req.user._id,
        pluginName: pluginName
      }, "post plugin install");

      return res.json({
        "plugin": plugin,
        "didInstalled": plugin.isInstalled
      });
    }catch(err){
      logger.error({
        err: err,
        user_id: req.user._id,
        pluginName: pluginName
      }, "error posting plugin install");

      next(err);
    }
  }),

  postActivate: coroutine(function *postActivateGen(req, res, next) {
    var pluginName = req.params.pluginName;
    try{
       var plugin = yield plugins.activatePlugin(pluginName);

      logger.log({
        user_id: req.user._id,
        pluginName: pluginName
      }, "post plugin activate");

      return res.json({
        "plugin": plugin,
        "didActivate": plugin.isActive
      });
    }catch(err){
      logger.error({
        stack: err.stack,
        err: err,
        user_id: req.user._id,
        pluginName: pluginName
      }, "error posting plugin activate");

      next(err);
    }
  }),

  deleteActivate: coroutine(function *deleteActivateGen(req, res, next) {
    var pluginName = req.params.pluginName;
    try{
       var plugin = yield plugins.deactivatePlugin(pluginName);

      logger.log({
        user_id: req.user._id,
        pluginName: pluginName
      }, "delete plugin activate");

      return res.json({
        "plugin": plugin,
        "didDeactivate": !plugin.isActive
      });
    }catch(err){
      logger.error({
        stack: err.stack,
        err: err,
        user_id: req.user._id,
        pluginName: pluginName
      }, "error deleting plugin activate");

      next(err);
    }
  })
}
