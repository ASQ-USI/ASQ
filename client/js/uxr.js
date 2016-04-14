/** @module client/js/uxr
    @description push events to uxr.
*/

'use strict';

var debug = require('bows')("uxr");
var $ = require('jquery');

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/
var UUID = (function() {
  var self = {};
  var lut = []; for (var i=0; i<256; i++) { lut[i] = (i<16?'0':'')+(i).toString(16); }
  self.generate = function() {
    var d0 = Math.random()*0xffffffff|0;
    var d1 = Math.random()*0xffffffff|0;
    var d2 = Math.random()*0xffffffff|0;
    var d3 = Math.random()*0xffffffff|0;
    return lut[d0&0xff]+lut[d0>>8&0xff]+lut[d0>>16&0xff]+lut[d0>>24&0xff]+'-'+
      lut[d1&0xff]+lut[d1>>8&0xff]+'-'+lut[d1>>16&0x0f|0x40]+lut[d1>>24&0xff]+'-'+
      lut[d2&0x3f|0x80]+lut[d2>>8&0xff]+'-'+lut[d2>>16&0xff]+lut[d2>>24&0xff]+
      lut[d3&0xff]+lut[d3>>8&0xff]+lut[d3>>16&0xff]+lut[d3>>24&0xff];
  }
  return self;
})();

module.exports = {
  createUXREvent: function(session, sessionUser, type, data){
    var clienttimestamp = data.clienttimestamp;
    delete data.clienttimestamp;
    return {
      type: type, 
      corid: UUID.generate(), 
      session: session, 
      sessionuser: sessionUser,
      clienttimestamp: clienttimestamp,
      data: data
    };
  },
  sendToUxr: function (data) {
    if (data === null)
      return;
    
    $.ajax({
      type : "POST",
      url : "http://localhost:55555/api/UXS/SendEvent",
      data : {
        "Token" : "ASQ-3v3nts_30126",
        "Value" : JSON.stringify(data),
        "ValidFrom" : new Date().toISOString() 
      },
      dataType : 'json',
      success : function(response) {
      },
      error : function(error) {
        console.log(error.statusText);
      }
    });
  }
}
