/** 
 * @module lib/plugin/registry
 * @description communication interface between plugins and ASQ
*/

'use strict';

var _ = require('lodash');
var hooks = require('../hooks/hooks');
var registry = {};

module.exports = {
  addHook: function(pluginName, hookName, cb){
    if(! _.isString(pluginName)){
      return logger.warn('addHook: First argument is not a string. Aborting')
    }
    if(! _.isString(hookName)){
      return logger.warn('addHook: Second argument is not a string. Aborting')
    }
    if(! _.isFunction(cb)){
      return logger.warn('addHook: Third argument is not a function')
    }

    registry[pluginName] = registry[pluginName] || {};
    registry[pluginName][hookName] = registry[pluginName][hookName] || [];
    registry[pluginName][hookName].push(cb);
  },

  deregisterPlugin: function(pluginName){
    if(! registry[pluginName]){
      logger.warn('deRegisterPlugin: There were no hooks for this plugin to deregister')
    }

    _.forEach(registry[pluginName], function(hooksArr, hookName){
      _.forEach(hooksArr, function(cb){
        hooks.deregisterHook(hookName, cb);
      });
    });
  }
}