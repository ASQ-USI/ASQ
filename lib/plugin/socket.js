/** @module lib/plugin/socket
    @description socket interface for plugins
*/
'use strict';

var socketEmitter = require('../socket/pubsub');

module.exports = {
  
  emitToRoles : function( evtName, evt, sessionId){
    //if we have no namespaces return
    if (arguments.length < 4) {
      return;
    }
    socketEmitter.emit('emitToRoles',{
      evtName : evtName,
      event : evt,
      sessionId : sessionId,
      namespaces: Array.prototype.slice.call(arguments, 3)
    });
  },

  emit : function( evtName, evt, socketId){
    socketEmitter.emit('emit',{
      evtName : evtName,
      event : evt,
      socketId : socketId
    });
  },
};