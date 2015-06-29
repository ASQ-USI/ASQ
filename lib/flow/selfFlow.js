'use strict';

var when        = require('when');
var gen         = require('when/generator');
var wkeys       = require('when/keys');
var nodefn      = require('when/node/function');
var logger      = require('../logger').appLogger;
var Session     = db.model('Session');
var Question    = db.model('Question');

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
