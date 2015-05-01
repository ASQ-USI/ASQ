'use strict';

var _ = require("lodash");
var logger = require('../logger').appLogger
var Promise = require("bluebird");

module.exports = {
  hookCbs : Object.create(null),
  registerHook: function(name, fn){
    if(! _.isFunction(fn)) {
      logger.debug('trying to register a Hook for `%s` with an argument that is not a function', name)
      return;
    }

    this.hookCbs[name] = this.hookCbs[name] || [];
    this.hookCbs[name].push(fn);
  },

  deregisterHook: function(name, fn){
    if(! _.isFunction(fn)) return;

    if (this.hookCbs[name]) {
        this.hookCbs[name] = _.without(this.hookCbs[name], fn);
    }
  },

  // doHook: function(name){
  //   if(! this.hookCbs[name]) return Promise.resolve(true);

  //   return Promise.map(this.hookCbs[name], function(fn){
      

  //     //don't take the args outside, otherwise you might run into race conditions
  //     var args = Array.prototype.slice.call(arguments, 1);

  //     return Promise.resolve(fn.apply(null, args));
  //   });
  // },

  //this one w8s for each callback to finish before calling the next
  doHook: function(name){

    //if there are no callbacks return the hook initial value
    if(! this.hookCbs[name]) return Promise.resolve(arguments[1]);
    var args = Array.prototype.slice.call(arguments, 1);

    // the first time runTask will have as second argument an array of arguments
    // Subsequent invocations will accept a single arguments (it's going to be 
    // the resolved value of the promise of each reduce step)
    // That's why we substitue the function with another version
    var runTask = function (task, args) {
        runTask = function (task, arg) {
            return task(arg);
        };

        return task.apply(null, args);
    };

    return Promise.reduce(this.hookCbs[name], function(args, hookFn){     

      return Promise.resolve(runTask(hookFn, args));
    }, args);
  }
}