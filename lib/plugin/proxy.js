/** @module lib/plugin/proxy
    @description communication interface between plugins and ASQ
*/

'use strict';

var _ = require("lodash");
var socket =  require('./socket');
var hooks  = require('../hooks/hooks');
var registry = require('./registry');
var db = require('./db');


function generateProxyFunctions(pluginName){
  return {
    registerHook : function(hookName, cb){
      registry.addHook(pluginName, hookName, cb)
      return hooks.registerHook(hookName, cb);
    },
    socket: socket,
    db: db
  }
}

var Proxy = function(name){

    if (!name) {
        throw new Error('Must provide an app name for api context');
    }

  _.extend(this, generateProxyFunctions(name)); 
}

module.exports = Proxy;
