 // lib/socket/liveApp.js

const liveApp = require('../liveApp')

 
 module.exports = { 

 	handleSocketEvent : function(socket, evt){
 		switch(evt.type){
 			case "student-perception-change":
 				liveApp.handleSliderChange(socket,evt);
 				break;
			default:
				break;

 		}
 	}
 }