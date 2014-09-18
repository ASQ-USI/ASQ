/**
*  @fileoverview adapterSocketInterface.js
*  @description  provides presentation adapters with methods to interface
* with ASQ sockets
*
*/


/**
* @param {Object} asqSocket the client side asq socket
*/

module.exports = function(asqSocket){
  var debug = require('bows')("adapterSocketInterface")
  var cbs = [];

  asqSocket.on("asq:goto", function onSocketGoto(event){
    debug("Reveived goto event:", event);
    for(var i=0, l=cbs.length; i<l; i++){
      //don't let one bad function affect the rest of them
      try{
        cbs[i].call(null, event.data);
      }catch(err){
        debug(err.toString() + err.stack);
      }
    }
  });

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

  return{
    onGoto : onGoto,
    emitGoto: emitGoto
  }
}