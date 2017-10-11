 // lib/socket/liveApp.js

const liveApp = require('../liveApp')

 
 module.exports = { 

 	handleSocketEvent : function(socket, evt){
 		switch(evt.type){
 			case 'student-perception-change':
 				liveApp.handleSliderChange(socket,evt);
 				break;
      case 'student-question-submitted':
        liveApp.handleSubmittedQuestion(socket, evt);
        break;
      case 'student-question-rated':
        liveApp.handleQuestionRated(socket, evt);
        break;
      case 'close-question-broadcast':
      	liveApp.handleCloseStudentQuestionBroadcastAndNotify(socket, evt);
        break;
      case 'toggle-student-question-functionality':
      	liveApp.handleStudentQuestionsFunctionality(socket, evt);
      	break;
      case 'broadcast-student-question':
      	liveApp.handleBroadcastStudentQuestionAndNotify(socket, evt);
       break;
			default:
				break;

 		}
 	}
 }
