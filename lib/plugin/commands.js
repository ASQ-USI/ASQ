/** @module lib/plugin/commands
    @description allows plugins to send commands to ASQ
*/

'use strict';

var socketEmitter = require('../socket/pubsub');

module.exports = {
  sendSocketEventToNamespaces : function( evtName, evt, sessionId, namespaces){
    socketEmitter.emit('notifyNamespaces',{
      evtName : evtName,
      event : evt,
      sessionId : sessionId,
      namespaces: namespaces
    });
  },
};