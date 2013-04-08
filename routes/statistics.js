exports.getSessionStats = function(req, res) {
	var sessionDB = db.model('Session', schemas.sessionSchema);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	var questionDB = db.model('Question', schemas.questionSchema);

	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			
			//Find all sessions for this slideshow
			sessionDB.find({slides: req.query.id}, function(err, allSessions) {
				
				//Get dates of all sessions 
				var sessionArray = new Array();
				for (var i = 0; i < allSessions.length; i++) {
					 var timeString = allSessions[i].date.getDate() + "." 
								    + allSessions[i].date.getMonth() +"." 
								    + allSessions[i].date.getFullYear() + " " 
								    + allSessions[i].date.getHours() + ":" 
								    + allSessions[i].date.getMinutes();
								    
					sessionArray.push(timeString);
				}
				
				
				//Find all Questions
				var questions = new Array();
				for (var i = 0; i < slideshow.questions.length; i++) {
					questionDB.findById(slideshow.questions[i], function(err, question) {
						if (question) {
							questions.push(question.questionText);
						}
						//Render it after last question added!
						if (questions.length == slideshow.questions.length) {
							res.render('statistics', {
							username : req.user.name,
							session : sessionArray,
							title : slideshow.title,
							questions : questions 
						});			
						}
					});
				}
				

				//If session is slected load data
				if (req.query.session != null) {
					//find questions for slideshow
					slideshowDB.findById(req.query.id, function(err, slideshow) {
						//repeat for every question in slideshow
						for (var quest = 0; quest < question.length; quest++) {
							getStats(questionId, req.query.session, function(err, stats) {
								results.push(stats);
							});
						}
					});
				}

			
			});
		}
	});

}
