/** 
 * @module lib/plugin/registry
 * @description maintains lists of hook and events callbacks for each plugin
*/

'use strict';

var _ = require('lodash');
var hooks = require('../hooks/hooks');
var pubsub = require('./pubsub');
var logger = require('logger-asq');
var hookRegistry = {};
var eventRegistry = {};

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

    hookRegistry[pluginName] = hookRegistry[pluginName] || {};
    hookRegistry[pluginName][hookName] = hookRegistry[pluginName][hookName] || [];
    hookRegistry[pluginName][hookName].push(cb);
  },

  addEvent: function(pluginName, eventName, cb){
    if(! _.isString(pluginName)){
      return logger.warn('addEvent: First argument is not a string. Aborting')
    }
    if(! _.isString(eventName)){
      return logger.warn('addEvent: Second argument is not a string. Aborting')
    }
    if(! _.isFunction(cb)){
      return logger.warn('addEvent: Third argument is not a function')
    }

    eventRegistry[pluginName] = eventRegistry[pluginName] || {};
    eventRegistry[pluginName][eventName] = eventRegistry[pluginName][eventName] || [];
    eventRegistry[pluginName][eventName].push(cb);
  },

  deregisterPlugin: function(pluginName){
    if(! hookRegistry[pluginName]){
      logger.warn('deRegisterPlugin: There were no hooks for this plugin to deregister')
    }

    if(! eventRegistry[pluginName]){
      logger.warn('deRegisterPlugin: There were no events for this plugin to deregister')
    }

    _.forEach(hookRegistry[pluginName], function(hooksArr, hookName){
      _.forEach(hooksArr, function(cb){
        hooks.deregisterHook(hookName, cb);
      });
    });

    _.forEach(eventRegistry[pluginName], function(eventsArr, eventName){
      _.forEach(eventsArr, function(cb){
        pubsub.off(eventName, cb);
      });
    });
  }
}