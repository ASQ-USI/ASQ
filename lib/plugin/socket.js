/** @module lib/plugin/socket
    @description socket interface for plugins
*/
'use strict';

var socketEmitter = require('../socket/pubsub');

module.exports = {
  sendEventToNamespaces : function( evtName, evt, sessionId, namespaces){
    socketEmitter.emit('notifyNamespaces',{
      evtName : evtName,
      event : evt,
      sessionId : sessionId,
      namespaces: namespaces
    });
  },
};