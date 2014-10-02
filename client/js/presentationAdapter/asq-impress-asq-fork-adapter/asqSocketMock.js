/**
*  @fileoverview asqSocketMock.js
*  @description  Mimics the interface of an asqSocket interface. When a goto event is sent
* it is immediately received and the onGoto callback is called
*
*  Released under the MIT and GPL Licenses.
*
* ------------------------------------------------
*  author:  Vasileios Triglianos
*  version: 0.0.1
*  source:  http://github.com/ASQ-USI/asq-impress-adapter/
*
*/


/**
* @param {Object} asqSocket an interface object to the real asq socket.
*/
'use strict';

var debug = require('bows')("asqSocketMock")
var onGotoCb = null;

module.exports.onGoto = function(cb){
  if("function" !== typeof cb){
    throw new Error("cb should be a function")
  }
  onGotoCb = cb;
}

module.exports.emitGoto = function(data){
 debug("Emitting goto data:", data);
  receiveData(data);
}

var receiveData = function(data){
 debug("Received goto data:", data);
  
  if(onGotoCb){
    debug("Calling callback");
    onGotoCb.call(null, data);
  }
}