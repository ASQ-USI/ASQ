/** @module lib/plugin/socket
    @description socket interface for plugins
*/
'use strict';

var socketEmitter = require('../socket/pubsub');

module.exports = {
  
  emitToRoles : function( evtName, evt, sessionId, namespaces){
    socketEmitter.emit('emitToRoles',{
      evtName : evtName,
      event : evt,
      sessionId : sessionId,
      namespaces: namespaces
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