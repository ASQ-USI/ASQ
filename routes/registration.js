var schemas = require("../models/models.js")
, Slideshow = require("../models/slideshow")
, fs        = require("fs")
, moment    = require('moment')
, dust      = require('dustjs-linkedin')
, check     = require('validator').check;

var isValidUserName = function(candidateUser) {
	// Match string between 3 and 12 chars starting with a letter, lower or upper case 
	// and containing only letters (both cases, digits, dashes, underscores and dots.
	var userRegex = /(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\-\.]*$/;
	return userRegex.test(candidateUser);

}

var isValidPassword = function(candidatePass) {
	// Match a string between 8 and 30 chars
	// and containing only letters (both cases), digits and the following characters: ! @ # % : _ ( ) $ ^ & * - . ?
	// It also must contain at least one upper case letter, one lower case and one digit and it cannot contain spaces.
	var passwordRegex = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z:!@#%_\(\)\$\^\&\*\-\.\?]*$/;
	return passwordRegex.test(candidatePass);
}

var isValidEmail = function(candidateEmail) {
	return check(candidateEmail).len(6, 64).isEmail();
}

exports.getsingle = function(req, res) {
	res.sendfile(req.path);
}
//User is added to the database, and page is redirected to confirm the registration
exports.signup = function(req, res) {
	// Empty Fields
	if (req.body.signupusername == "" || req.body.signuppassword == "") {
		res.render('index', {
			message : "Missing credentials",
			fromsignup : true
		});
		return;
	}

	// Username syntax
	if (!isValidUserName(req.body.signupusername)) {
		res.render('index', {
			message : "User name should be between 3 and 12 characters and only contain letters, digits or . - _.",
			fromsignup : true
		});
		return;
	}
	
	// Email
	if (!isValidEmail(req.body.signupemail)) {
		res.render('index', {
			message : "Please insert a valid email adress",
			fromsignup : true
		});
		return;
	}

	//Password
	if (!isValidPassword(req.body.signuppassword)) {
		res.render('index', {
			message : "Password should be betwwen 8 and 30 characters and have at least a lower case letter, an upper case letter and a digit. It can contain the following symbols: ! @ # % : _ ( ) $ ^ & * - . ?",
			fromsignup : true
		});
		return;
	}

	if (req.body.signuppassword != req.body.signuppasswordconfirm) {
		res.render('index', {
			message : "The two passwords are not matching",
			fromsignup : true
		});
		return;
	}

	// Username availability and saving
	var users = db.model('User', schemas.userSchema);
	var out = users.findOne({
		name : req.body.signupusername
	}, function(err, user) {
		if (user) {
			res.render('index', {
				message : "Username already taken",
				fromsignup : true
			});
		} else {
			var newUser = new users({
				name : req.body.signupusername,
				password : req.body.signuppassword,
				email : req.body.signupemail
			});
			newUser.save();
			res.render('index', {message: "Account was created"} );
		}
	});

}

exports.checkusername = function(req, res) {
	//Send invalid username if the format is wrong
	if (!isValidUserName(req.params.username)) {
		res.send(200, '2');
	}

	User = db.model('User', schemas.userSchema);
	var response = '0';
	var out = User.findOne({
		name : req.params.username
	}, function(err, user) {
		if (user) {
			response = '1';
		}
		res.send(200, response);
	});
}
function loadJSON(filePath) {
	var file = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(file);
}

function preload(jsonFile) {
	var question = new Object({
		questionText : jsonFile.questionText,
		questionType : jsonFile.questionType,
		afterslide : jsonFile.afterslide,
		options : jsonFile.options
	});
	return question;

}

// exports.sendstats = function(req, res) {
// 
	// var questionDB = db.model('Question', schemas.questionSchema);
	// var optionDB = db.model('Option', schemas.optionSchema);
// 
	// questionDB.findById(req.params.id, function(err, question) {
		// optionDB.find({
			// _id : {
				// $in : question.answeroptions
			// }
		// }, function(err, options) {
			// if (err)
				// throw err;
// 
			// getQuestionStats(req.params.id, function(err, stats) {
// 
				// var correct = [['Correct answers', 'Number of answers'], ['Correct', stats.correct], ['Wrong', stats.wrong]]
// 
				// var countedMcOptions = [[question.questionText, "Number of answers"]]
				// for (ans in stats.equalAnswers) {
					// //console.log("###########");
					// countedMcOptions.push([options[ans].optionText, stats.countedMcOptions[ans]]);
				// }
// 
				// var equalAnswers = [['Different answers', 'Number of answers']]
				// for (ans in stats.equalAnswers) {
					// //console.log("###########");
					// equalAnswers.push([stats.equalAnswers[ans].ansContent.toString(), stats.equalAnswers[ans].count]);
				// }
// 
				// //console.log(countedMcOptions);
				// res.send(200, {
					// correct : correct,
					// countedMcOptions : countedMcOptions,
					// equalAnswers : equalAnswers
				// });
// 
			// });
		// });
	// });
// 
// }

// exports.getStats = function(questionId, sessionId, callback) {
	// var Question = db.model('Question', schemas.questionSchema);
	// Question.findById(questionId).populate('answeroptions').exec(function(err, question) {
		// if (err)
			// callback(err);
		// getQuestionStats(questionId, sessionId, function(err, stats) {
			// if (err) {
				// callback(err);
				// return;
			// }
			// if (stats === null) {
				// callback(null, {
					// correct : {},
					// countedMcOptions : {},
					// equalAnswers : {}
				// });
				// return;
			// }
// 
			// var correct = [['Correct answers', 'Number of answers'], ['Correct', stats.correct], ['Wrong', stats.wrong]]
// 
			// var countedMcOptions = [[question.questionText, "Number of answers"]]
			// if (question.questionType === "Multiple choice") {
				// var lim = stats.countedMcOptions.length < question.answeroptions.length ? stats.countedMcOptions.length : question.answeroptions.length;
				// for (var ans = 0; ans < lim; ans++) {
					// //console.log("###########");
					// //This is what went wrong during the M4 demo
					// //The check below can prevent the same mistake
					// //But I don't know how it affects the expected result
					// if (question.answeroptions[ans])
						// countedMcOptions.push([question.answeroptions[ans].optionText, stats.countedMcOptions[ans]]);
				// }
			// }
// 
			// var equalAnswers = [['Different answers', 'Number of answers']]
			// for (ans in stats.equalAnswers) {
				// //console.log("###########");
				// equalAnswers.push([stats.equalAnswers[ans].ansContent.toString(), stats.equalAnswers[ans].count]);
			// }
			// callback(null, {
				// correct : correct,
				// countedMcOptions : countedMcOptions,
				// equalAnswers : equalAnswers
			// });
		// });
	// });
// }
// function getQuestionStats(questionId, sessionId, callback) {
	// var answerDB = db.model('Answer', schemas.answerSchema);
	// var questionDB = db.model('Question', schemas.questionSchema);
	// var optionDB = db.model('Option', schemas.optionSchema);
	// var sessionDB = db.model('Session', schemas.sessionSchema);
// 
	// //console.log("------------" + sessionId)
// 
	// questionDB.findById(questionId).populate('answeroptions').exec(function(err, question) {
		// sessionDB.findById(sessionId, function(err, session) {
			// answerDB.findOne({
				// _id : {
					// $in : session.answers
				// },
				// question : questionId
			// }, function(err, answer) {
				// if (err) {
					// callback(err);
					// return;
				// }
				// if (!answer) {
					// callback(null, null);
					// return;
				// }
				// // console.log("#### Answers")
				// // console.log(answer);
				// // console.log(answer.answers);
				// // console.log("--- Answers")
				// var result = {
					// questionText : "",
					// questionOptions : ["Lorem", "Ipsum", "Dolor", "Sit amet"],
					// questionType : "Multiple choice",
					// total : answer.answers.length,
					// correct : 1,
					// wrong : 1,
					// equalAnswers : null,
					// countedMcOptions : null,
				// }
// 
				// //Set question data
				// result.questionText = question.questionText;
				// result.questionType = question.questionType;
				// result.questionOptions = question.answeroptions;
// 
				// //Get array of correct answers
				// var correctWrong = getCorrectAnswers(answer.answers, question.answeroptions);
				// result.correct = correctWrong[0];
				// result.wrong = correctWrong[1];
// 
				// // Counting equal answers
				// result.equalAnswers = getEqualAnswers(answer.answers);
// 
				// // Counting selectet options for multiple choice
				// if (question.questionType === "Multiple choice") {
					// result.countedMcOptions = getCountedMCOptions(answer.answers, question);
				// }
// 
				// console.log(result);
				// callback(null, result);
			// });
		// });
	// });
// 
// }

// function getNumberOfAnswers(questionId) {
	// answerDB.findOne({
		// question : questionId
	// }, function(err, answer) {
		// return answer.answers.length();
// 
	// });
// }

// function getCorrectAnswers(answers, answerOptions) {
	// var correctAnswer = new Array();
	// for (var ans = 0; ans < answerOptions.length; ans++) {
		// if (answerOptions[ans].correct == true) {
			// correctAnswer.push(true);
		// } else if (answerOptions[ans].correct == false) {
			// correctAnswer.push(false);
		// } else if (answerOptions[ans].correct !== undefined) {
			// correctAnswer.push(answerOptions[ans].correct);
			// //console.log(typeof(answerOptions[ans].correct) +" "+answerOptions[ans].correct);
		// }
// 
	// }
	// console.log("Correct ans " + correctAnswer);
// 
	// //Check for correct answers
	// var correct = 0;
	// var wrong = 0;
	// for (var i = 0; i < answers.length; i++) {
		// //console.log(answers[i]);
		// console.log(answers[i].content + " " + correctAnswer[i] + " " + arrayEqual(answers[i].content, correctAnswer))
		// if (arrayEqual(answers[i].content, correctAnswer)) {
			// correct++;
		// } else {
			// wrong++;
		// }
	// }
	// return [correct, wrong];
// }
// 
// function getEqualAnswers(answers) {
	// var equalAnswers = new Array();
// 
	// for (var i = 0; i < answers.length; i++) {
		// var newAnswer = true;
// 
		// //Chack all already grouped equal answers
		// for (exAns in equalAnswers) {
			// //Anwer already exists
			// if (arrayEqual(answers[i].content, equalAnswers[exAns].ansContent)) {
				// equalAnswers[exAns].count++;
				// newAnswer = false;
			// }
// 
		// }
		// if (newAnswer) {
			// equalAnswers.push({
				// ansContent : answers[i].content,
				// count : 1
			// })
		// }
	// }
	// return equalAnswers;
// }

// function getCountedMCOptions(answers, question) {
	// var countetMcOptions = new Array();
	// if (question.questionType == "Multiple choice") {
		// //init array with 0
		// for (var i = 0; i < answers[0].content.length; i++) {
			// countetMcOptions.push(0);
		// }
// 
		// for (var j = 0; j < answers.length; j++) {
// 
			// for (var k = 0; k < answers[j].content.length; k++) {
				// if (answers[j].content[k] == true)
					// countetMcOptions[k]++;
			// }
// 
		// }
	// } else {
		// return null;
	// }
	// return countetMcOptions;
// }
// 
// function arrayEqual(array1, array2) {
	// if (array1.length !== array2.length) {
		// console.log(array1.length + " " + array2.length)
		// console.log("wrong length")
		// return false;
	// } else {
		// for (var i = 0; i < array1.length; i++) {
			// if (array1[i].toString() != array2[i].toString()) {
				// console.log( typeof (array1[i]) + " - " + typeof (array2[i]))
				// return false;
			// }
		// }
	// }
	// return true;
// }

exports.settings = function(req, res){
	var users = db.model('User', schemas.userSchema);
	var out = users.findById(req.user._id, function(err, user) {
		if (user) {
			res.render('settings', {
				user: user
			})
			
		}
	});
}

exports.saveSettings = function(req, res){
	// Username
	if (req.body.inputUsername.length > 0 && !isValidUserName(req.body.inputUsername)) {
		res.render('settings', {
			alert : "User name should be between 3 and 12 characters and only contain letters, digits or . - _.",
		});
		return;
	}
	
	// Password Syntax
	if (req.body.inputPassword.length > 0 && !isValidPassword(req.body.inputPassword)) {
		res.render('settings', {
			alert : "Password should be betwwen 8 and 30 characters and have at least a lower case letter, an upper case letter and a digit. It can contain the following symbols: ! @ # % : _ ( ) $ ^ & * - . ?",
		});
		return;
	}

	if (req.body.inputPassword != req.body.inputRePassword && req.body.inputPassword > 2) {
		res.render('settings', {
			alert : "The two passwords are not matching .",
		});
		return;
	}

	// Email
	if (req.body.inputEmail.length > 0 && !isValidEmail(req.body.inputEmail)) {
		res.render('settings', {
			alert : "Please insert a valid email adress",
		});
		return;
	}

	var users = db.model('User', schemas.userSchema);
	//Test if username already exists
	var out = users.findOne({
		name : req.body.inputUsername
	}, function(err, user) {
		if (user) {
			res.render('settings', {
				message : "Username already taken"
			});
		}
		return;
	});
	
	//Obejct with only changes
	var newValues = {}
	if(req.body.inputUsername.length > 0){
		newValues.name = req.body.inputUsername;
	}
	if(req.body.inputPassword.length > 0){
		newValues.password = req.body.inputPassword;
	}
	if(req.body.inputEmail.length > 0){
		newValues.email = req.body.inputEmail;
	}
	
	//update user
	var out = users.findById(req.user._id, function(err, user) {
		if (user) { // What about err?
			user.set(newValues);
			user.save(function(err, user) {
				if (err) res.render('settings', {
					user: newValues,
					alert: "Something went wrong. Your data was not saved.",
					type: "error"
				});
				res.render('settings', {
					user:  newValues,
					alert: "Acoount successfully updated!",
					type: "success"
				});	
			});
		}
	});
	// var out = users.findByIdAndUpdate(req.user._id, newValues, function(err, user) {
	// 	if (user) {
	// 		res.render('settings', {
	// 			user: newValues,
	// 			alert: "Acoount successfully updated!",
	// 			type: "success"
	// 		})
	// 	}
	// });
	
}

exports.renderuser = function(req, res) {
	if (req.params.username == req.user.name) {
		var users = db.model('User', schemas.userSchema);
		var out = users.findById(req.user._id, function(err, user) {
			if (user) {
				var slideshowDB = db.model('Slideshow', Slideshow.slideshowSchema);
				slideshowDB.find({
					_id : {
						$in : user.slides
					}
				}, function(err, slides) {
					if (err){throw err;}
					var type = req.query.type && /(succes|error|info)/g.test(req.query.type) ? 'alert-' + req.query.type : '';
					
					var courses = [];
					for(var i = 0; i < slides.length; i++){
						if(courses.indexOf(slides[i].course) == -1){
							if(courses.indexOf(slides[i].course) == ""){
								courses.push("Unnamed course");
							}else{
								courses.push(slides[i].course);
							}
						} 
					}
					
					
					for(var i = 0; i <slides.length; i++){
						slides[i] = {
							_id: slides[i]._id,		
							title: slides[i].title,
							lastEdit: moment( slides[i].lastSession).format('DD.MM.YYYY HH:mm'),
							lastSession: moment( slides[i].lastEdit).format('DD.MM.YYYY HH:mm'),
							course: slides[i].course
							};
					}
					
					
					
					
					var slidesByCourses = []
					for(var i = 0; i <courses.length; i++){
						var temp = [];
						
						for(var j = 0; j < slides.length; j++){
							if(slides[j].course === courses[i]){
								temp.push(slides[j]);
							}
						}
						
						slidesByCourses.push({
							course: courses[i],
							slides: temp
							}
					);
					}
					
					
				console.log(slidesByCourses);
					res.render('user', {
						arrayslides : slides,
						slidesByCourses: slidesByCourses,
						username : req.user.name,
						host : appHost,
						port : app.get('port'),
						id : user.current,
						alert : req.query.alert,
						type : type,
						session : user.current
					});
				});

			}
		});
	} else {
		res.redirect('/user/' + req.user.name + '/');
	}
}

//EJS helper to print dates in nice format. Done by Moment.js
// ejs.filters.fromNow = function(date){
  // return moment(date).format('DD.MM.YYYY HH:mm');
// }
dust.helpers.formatDate = function (chunk, context, bodies, params) {
   	 var value = dust.helpers.tap(params.value, chunk, context),
        timestamp,
        month,
        date,
        year;

    timestamp = new Date(value);
    month = timestamp.getMonth() + 1;
    date = timestamp.getDate();
    year = timestamp.getFullYear();

    return chunk.write(date + '.' + month + '.' + year);
};

