/** @module lib/plugin/proxy
    @description communication interface between plugins and ASQ
*/

'use strict';

var _ = require("lodash");
var commands =  require('./commands');
var socket =  require('./socket');
var hooks  = require('../hooks/hooks');

var Proxy = function(){
  this.commands = commands; 
  this.socket = socket; 
  this.db = db;
}

Proxy.prototype.command = function(command){
  if(_.isEmpty(command) || ! this.commands[command]){
    throw new Error("command `%s` does not exist", command);
  }

  var fn = this.commands[command];
  if(! _.isFunction(fn)){
    throw new Error("command `%s` is not a function", command);
  }

  console.log("proxy.command is deprecated, please use dedicated APIs");

  return fn.apply(null, Array.prototype.slice.call(arguments, 1));
}

Proxy.prototype.registerHook = function(name, fn){
  hooks.registerHook(name, fn);
}

module.exports = Proxy;