function getSessionsOfUser(user){
	var sessionDB = db.model('Session', schemas.sessionSchema);
	sessionDB.find({presenter: user}, function(err, sessions){
		//console.log("3############");	
		console.log(sessions);
	});	
}

function getSlides(questionID){
	var questionDB = db.model('Question', schemas.questionSchema);
	questionDB.findBy(questionID, function(err, question){
		//console.log("3############");	
		console.log(question);
	});	
}

exports.getSessionStats = function (req, res) {
	getSessionsOfUser(req.user._id);
  
  	console.log("hahaha" + req.user._id);
  	res.render('statistics', {username: req.user.name, html: req.body.editorvalue});
}
