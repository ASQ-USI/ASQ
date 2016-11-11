 // lib/socket/liveApp.js

const liveApp = require('../liveApp')

 
 module.exports = { 

 	handleSocketEvent : function(socket, evt){
 		switch(evt.type){
 			case "SLIDER_CHANGED":
 				liveApp.handleSliderChange(socket,evt);
 				break;
			default:
				break;

 		}
 	}
 }