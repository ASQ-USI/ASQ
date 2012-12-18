exports.getSessionStats = function (req, res) {
	var sessionDB = db.model('Session', schemas.sessionSchema);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	var questionDB = db.model('Question', schemas.questionSchema);
	
	var slideshowID = req.query.id;
	
	var results = new Array();
	
	sessionDB.find({presenter: req.user._id}, function(err, allSessions){
		var sessionArray = new Array();
		for(var i = 0; i < allSessions; i++){
			sessionArray.push(allSessions.date);
		}
		
		//If session is given
		if(req.query.session != null){
			//find questions for slideshow
			slideshowDB.findById(req.query.id, function(err, slideshow){
				//repeat for every question in slideshow
				for(var quest =0; quest  < question.length; quest++){
					getStats(questionId, req.query.session, function(err, stats){
							results.push(stats);
					});
				}				
			});
		}
			
	});	
	
  	res.render('statistics', {username: req.user.name, stats:results});
}
