'use strict';

var when        = require('when')
  , gen         = require('when/generator')
  , wkeys       = require('when/keys')
  , nodefn      = require('when/node/function')
  , logger      = require('../logger').socLogger
  , appLogger   = require('../logger').appLogger
  , Session     = db.model('Session')
  , Question    = db.model('Question');

module.exports = function(socketUtils){

  /*
   *  Send the goto event back to the sender
   */
  var goto = gen.lift(function *gotoGen(socket, evt) {
    try{
      //only accept ctrl goto events
      if (socket.nsp.name !== '/ctrl' && socket.nsp.name !== '/folo') return;
      socket.emit('asq:goto', evt)

    }catch(err) {
      logger.error('On goto: ' + err.message, {err: err.stack});
    };
  });

  var handleSocketEvent = function(eventName, socket, evt){
     switch(eventName){
      case "asq:goto":
        goto(socket, evt);
        break
     }
  }

  return{
    handleSocketEvent:handleSocketEvent
  }

}
