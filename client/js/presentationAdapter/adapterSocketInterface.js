/**
*  @fileoverview adapterSocketInterface.js
*  @description  provides presentation adapters with methods to interface
* with ASQ sockets
*
*/


/**
* @param {Object} asqSocket the client side asq socket
*/

module.exports = function(asqSocket, bounce){
  bounce = bounce || false
  var debug = require('bows')("adapterSocketInterface")
  var cbs = [];

  asqSocket.on("asq:goto", function onSocketGoto(evt){
    debug("Reveived goto event:", evt);
    onGotoReceived(evt);
  });

  var onGotoReceived = function(evt){
    for(var i=0, l=cbs.length; i<l; i++){
      //don't let one bad function affect the rest of them
      try{
        cbs[i].call(null, evt.data);
      }catch(err){
        debug(err.toString() + err.stack);
      }
    }
  }

  var onGoto = function(cb){
    if("function" !== typeof cb){
      throw new Error("cb should be a function")
    }
    cbs.push(cb)
  }

  var emitGoto = function(data){
    debug("Emitting goto data:", data);
    asqSocket.emit('asq:goto', {
      data : data
    });
    debug("Data was emitted:");
  }

  var bounceGoto = function(data){
    debug("Bouncing goto data:", data);
    onGotoReceived({data : data });
    debug("Data was bounced:");
  }

  return{
    onGoto : onGoto,
    emitGoto: (bounce? bounceGoto: emitGoto)
  }
}