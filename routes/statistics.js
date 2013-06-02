/** Statistics */
module.exports.createSampleData = function(req, res) {
	
	//Load required models
	var Question = db.model('Question', schemas.questionSchema);
	var Session = db.model('Session', schemas.sessionSchema);
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
	var Answer = db.model('Answer', schemas.answerSchema);
	
	
	//Create sample Question 
	var newQuestion = new Question({
		stem : "<h3 class=\"stem\">Lugano is located in...</h3>",
		htmlId : "q-1",
		questionType : "multi-choice",
		formButtonType : "radio",
		questionOptions : [{
			correct : true,
			classList : "option",
			text : "Switzerland"
		}, {
			correct : false,
			classList : "option",
			text : "Italy"
		}, {
			correct : false,
			classList : "option",
			text : "France"
		}, {
			correct : true,
			classList : "option",
			text : "Germany"
		}]
	}); 


	//Create sample Slideshow
	var newSlideshow = new Slideshow({
		title : "A sample slideshow for stats",
		studentFile: "nonExistingFile.none",
		teacherFile: "nonExistingFile.none",
		originalFile: "nonExistingFile.none",
		course: "A sample course",
		lastEdit: new Date(),
		lastSession: new Date(),
		questions:[newQuestion._id]
	});
	
	
	//Create sample Answers
	
	for(var i = 0; i < 15; i++){
		var newAnswer = new Answer({
			answeree : "Student" + i,
			question: newQuestion._id
		});
		
		if(i % 2 == 0){
			newAnswer.submission  = [true,false,false,false];
			newAnswer.correctness = 100;
		}else{
			newAnswer.submission  = [false,true,false,true];
			newAnswer.correctness = 0;
		}

		newAnswer.save();
	}

	
	
	console.log(newAnswer._id);
	
	newQuestion.save();
	newSlideshow.save();
	console.log("Sample answers created");
	res.send(200, "Sample answers created");
}


exports.getStats = function(req, res){
	
	//Load all db wich we can use for search
	var questionDB 	= db.model('Question', 	schemas.questionSchema);
	var sessionDB 	= db.model('Session', 	schemas.sessionSchema);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	var answerDB 	= db.model('Answer', 	schemas.answerSchema);
	
	// /stats/question...&metric=
	
	//Create search object - This object will be filled with all the stuff we want to search for
	var searchObj = {};

	//If search is by question add array of questionIds to search object
	if(req.query.question != undefined){
		searchObj.question =  {$in: req.query.question.split(",")};
	}
	
	//If search is by session add array of sessionIds to search object
	if(req.query.session != undefined){
		searchObj.question =  {$in: req.query.question.split(",")};
	}
	
	//If search is by user add array of userIds to search object
	if(req.query.user != undefined){
		searchObj.question =  {$in: req.query.question.split(",")};
	}
	
	//If search is by slideshow add array of slideshowIds to search object
	if(req.query.slideshow != undefined){
		searchObj.question =  {$in: req.query.question.split(",")};
	}
	
	//Search answerDB with search object
	answerDB.find(searchObj, function(err, answers){
		//If error is encountered
		if(err){
			console.log(err);
			res.send(500, "Error in search query.");
		} 
		//Claculate answers only if there are more than 1 submissions
		else if(answers.length > 0){
			
			//Right vs wrong stats
			if(req.query.metric == "rightVsWrong"){
				res.send(200, calcRightVsWrong(answers));
			}
			
			//Distict options stats 
			else if(req.query.metric == "distinctOptions"){
				
				//Test if question objects exists and if only one question is given (this metric works only with one question)
				if(searchObj.question != undefined && searchObj.question.$in.length == 1){
					questionDB.findById(searchObj.question.$in[0], function(err, question){
						if(err){
							console.log(err);
							res.send(500, "Error in search query.");
						}else if(question){
							res.send(200, calcDistictOptions(answers, question));
						}else{
							console.log("Question not found");
							res.send(404, "Question not found");
						}
					});
				} else{
					console.log("Question object missing or multiple objects given")
					res.send("Question object missing or multiple objects given")
				}
			}
			//Distinct answers stats
			else if(req.query.metric == "distinctAnswers"){
				//Test if question objects exists and if only one question is given (this metric works only with one question)
				if(searchObj.question != undefined && searchObj.question.$in.length == 1){
					questionDB.findById(searchObj.question.$in[0], function(err, question){
						if(err){
							console.log(err);
							res.send(500, "Error in search query.");
						}else if(question){
							res.send(200, calcDistictAnswers(answers, question));
						}else{
							console.log("Question not found");
							res.send(404, "Question not found");
						}
					});
				} else{
					console.log("Question object missing or multiple objects given")
					res.send("Question object missing or multiple objects given")
				}
			}else{
				res.send(404, "Metric is missing try &metric=distinctAnswers or &metric=distinctOptions or &metric=rightVsWrong")
			}
			
			
		} 
		//Return nothing if no answers found
		else {
				res.send(200, "No stats found");
		}

	});
	
	
}

//Given an array of answers, how many are right or wrong
//Returns object {correct: x, wrong: y}
function calcRightVsWrong(answers){
	 
	 //Prepare return object
	 var result = {
	 	correct	: 0,
	 	wrong	: 0 
	 }
	 
	//Return empty element if no answer provided
	if(answers.length == 0 ){
		return result;
	}
	
	//Iterate over array and update return object
	for(var i=0; i < answers.length; i++){
		if(answers[i].correctness == 100){
			result.correct++;
		}else{
			result.wrong++;
		}
	}
	
	//returns object
	return result;
}



//Given an array of answers and the solution to the question, returns array of distinct options  
function calcDistictOptions(answers, question){
	
	//Check if answers contains more than one submission and question is defined
	if(answers.length < 1 || question == undefined){
		console.log("Error in calculating disctinct options: No answers provided or question missing")
		return;
	}
	
	//Prepare return object
	var result = [];
	
	
	//If questiion is a multiple choice question -> submission is array of boolean
	if(question.questionType = "multi-choice"){
		
		//All submissions must have same amount of options 
		var optionsLength = question.questionOptions.length;
		
		//Fill return object with 
		for(var i=0; i < optionsLength; i++){
			result.push({
				text: question.questionOptions[i].text,
				correct: question.questionOptions[i].correct,
				quantity: 0 //How often option was selected
			});
		}
		
		//Iterate over answers
		for (var i=0; i < answers.length; i++) {
			//Check if answer has the correct amount of options
			if(answers[i].submission.length != optionsLength){
				console.log("Error in calculating disctinct options: Multiple choice options differ in length. This can't be as every answer has to have the same length.")
			}
		
			//Update return object
			//For every option in submission of an answer check if selected and if true increase value in return object
			for (var j=0; j < optionsLength; j++) {
				if(answers[i].submission[j] == true){
					result[j].quantity++;
				}
			};
		  
		};
	}
	
	//Else (missing or unknown question type) log error
	else{
		console.log("Error in calculating disctinct options: question type is unknown or mission: ");
		console.log(question.questionType)
	}
	
	return result;
}



//Given an array of answers and the solution to the question, returns array of distinct options  
function calcDistictAnswers(answers, question){
	
	//Check if answers contains more than one submission and question is defined
	if(answers.length < 1 || question == undefined){
		console.log("Error in calculating disctinct answers: No answers provided or question missing")
		return;
	}
	
	//Prepare return object
	var result = new Array();
	
	
	//If questiion is a multiple choice question -> submission is array of boolean
	if(question.questionType = "multi-choice"){
		
		//All submissions must have same amount of options 
		var optionsLength = question.questionOptions.length;
		
		//Get correct answer
		var solution = new Array();
		for (var i=0; i < optionsLength; i++) {
		  solution.push(question.questionOptions[i].correct);
		};
	
		
		
		//Iterate over answers
		for (var i=0; i < answers.length; i++) {
			//Check if answer has the correct amount of options
			if(answers[i].submission.length != optionsLength){
				console.log("Error in calculating disctinct options: Multiple choice options differ in length. This can't be as every answer has to have the same length.")
			}
		
			//Remember id answer is not part of results yet
			var newAnswer = true		
			
			//Check if answer was seen before. If yes increase quantity, if no add to results.
			
			for (var j=0; j < result.length; j++) {	
				//Check if answer alreday exists in results and if yes increase quantity
			  	if(arrayEqual(result[j].submission, answers[i].submission)){
			  		result[j].quantity++;
			  		newAnswer = false;
			  		break;
			  	}
			 };
			 //If still new anser add to reluts
			 if(newAnswer){
			  		var correct;
			  		//Check if new answer is correct
			  		if(arrayEqual(answers[i], solution)){
			  			correct = true;
			  		}else{
			  			correct = false;
			  		}
			  		
			  		//text that contains all selected answer option texts
			  		var text = "";
			  		var selected = new Array();
			  		for (var k=0; k < answers[i].submission.length; k++) {
						if(answers[i].submission[k]==true){
							selected.push(question.questionOptions[k].text);
							text = text + String.fromCharCode(65 + k) + " ";
						}
					};
					var text = text + "- " + selected.join(", ");
					
					//push new answer to results
			  		result.push({
			  			submission: answers[i].submission,
						text: text,
						correct: correct,
						quantity: 1 //How often option was selected
					});
			  	}
		  
		};
	}
	//Else if text-question
	else if(question.questionType = "text"){
		
		//All submissions must have same amount of options 
		var optionsLength = question.questionOptions.length;
		
		//Get correct answer
		var solution = new Array();
		for (var i=0; i < optionsLength; i++) {
		  solution.push(question.questionOptions[i].correct);
		};
	
		
		
		//Iterate over answers
		for (var i=0; i < answers.length; i++) {
			//Check if answer has the correct amount of options
			if(answers[i].submission.length != optionsLength){
				console.log("Error in calculating disctinct options: Multiple choice options differ in length. This can't be as every answer has to have the same length.")
			}
		
			//Remember id answer is not part of results yet
			var newAnswer = true		
			
			//Check if answer was seen before. If yes increase quantity, if no add to results.
			
			for (var j=0; j < result.length; j++) {	
				//Check if answer alreday exists in results and if yes increase quantity
			  	if(arrayEqual(result[j].submission, answers[i].submission)){
			  		result[j].quantity++;
			  		newAnswer = false;
			  		break;
			  	}
			 };
			 //If still new anser add to reluts
			 if(newAnswer){
			  		var correct;
			  		//Check if new answer is correct
			  		if(arrayEqual(answers[i], solution)){
			  			correct = true;
			  		}else{
			  			correct = false;
			  		}
			  		
			  		//text that contains all selected answer option texts
			  		var text = "";
			  		var selected = new Array();
			  		for (var k=0; k < answers[i].submission.length; k++) {
						if(answers[i].submission[k]==true){
							selected.push(question.questionOptions[k].text);
							text = text + String.fromCharCode(65 + k) + " ";
						}
					};
					var text = selected.join(", ");
					
					//push new answer to results
			  		result.push({
			  			submission: answers[i].submission,
						text: text,
						correct: correct,
						quantity: 1 //How often option was selected
					});
			  	}
		  
		};
	}
	
	//Else (missing or unknown question type) log error
	else{
		console.log("Error in calculating disctinct options: question type is unknown or mission: ");
		console.log(question.questionType)
	}
	
	return result;
}

//Compares two arrys. Ignores capitalisation.
function arrayEqual(array1, array2) {
	if (array1.length !== array2.length) {
		console.log(array1.length + " " + array2.length)
		console.log("wrong length")
		return false;
	} else {
		for (var i = 0; i < array1.length; i++) {
			if (array1[i].toString().toLowerCase() != array2[i].toString().toLowerCase()) {
				console.log( typeof (array1[i]) + " - " + typeof (array2[i]))
				return false;
			}
		}
	}
	return true;
}



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
								    
					sessionArray.push({time: timeString});
				}
				
				
				//Find all Questions
				var questions = new Array();
				for (var i = 0; i < slideshow.questions.length; i++) {
					questionDB.findById(slideshow.questions[i], function(err, question) {
						if (question) {
							questions.push({
								text: question.questionText}
							);
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
