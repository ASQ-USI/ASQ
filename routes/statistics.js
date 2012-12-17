function getSessionsOfUser(user){
	var sessionDB = db.model('Session', schemas.sessionSchema);
	user = "50cdef2421947f4f07000002";
	sessionDB.find({presenter: user, question:questionId}, function(err, sessions){
		console.log("3############");	
		console.log(sessions);
	});	
}