var schemas = require("../models/models.js");
var fs = require("fs");
var moment = require('moment');
var dust = require('dustjs-linkedin');


exports.getsingle = function(req, res) {
	res.sendfile(req.path);
}
//User is added to the database, and page is redirected to confirm the registration
exports.signup = function(req, res) {
	if (req.body.signupusername == "" || req.body.signuppassword == "") {
		res.render('index', {
			message : "Missing credentials",
			fromsignup : true
		});
		return;
	}
	var myRegxp = /^([a-zA-Z0-9_-]){3,10}$/;
	if (myRegxp.test(req.body.signupusername) == false || myRegxp.test(req.body.signuppassword) == false) {
		res.render('index', {
			message : "Credentials must be only alphanumeric, between 3 and 10 characters",
			fromsignup : true
		});
		return;
	}
	var myRegxp = /\S+@\S+\.\S+/;
	if (myRegxp.test(req.body.signupemail) == false) {
		res.render('index', {
			message : "Please insert a valid email adress",
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
			res.render('registered', null);
		}
	});

}

exports.checkusername = function(req, res) {
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

exports.sendstats = function(req, res) {

	var questionDB = db.model('Question', schemas.questionSchema);
	var optionDB = db.model('Option', schemas.optionSchema);

	questionDB.findById(req.params.id, function(err, question) {
		optionDB.find({
			_id : {
				$in : question.answeroptions
			}
		}, function(err, options) {
			if (err)
				throw err;

			getQuestionStats(req.params.id, function(err, stats) {

				var correct = [['Correct answers', 'Number of answers'], ['Correct', stats.correct], ['Wrong', stats.wrong]]

				var countedMcOptions = [[question.questionText, "Number of answers"]]
				for (ans in stats.equalAnswers) {
					//console.log("###########");
					countedMcOptions.push([options[ans].optionText, stats.countedMcOptions[ans]]);
				}

				var equalAnswers = [['Different answers', 'Number of answers']]
				for (ans in stats.equalAnswers) {
					//console.log("###########");
					equalAnswers.push([stats.equalAnswers[ans].ansContent.toString(), stats.equalAnswers[ans].count]);
				}

				//console.log(countedMcOptions);
				res.send(200, {
					correct : correct,
					countedMcOptions : countedMcOptions,
					equalAnswers : equalAnswers
				});

			});
		});
	});

}

exports.getStats = function(questionId, sessionId, callback) {
	var Question = db.model('Question', schemas.questionSchema);
	Question.findById(questionId).populate('answeroptions').exec(function(err, question) {
		if (err)
			callback(err);
		getQuestionStats(questionId, sessionId, function(err, stats) {
			if (err) {
				callback(err);
				return;
			}
			if (stats === null) {
				callback(null, {
					correct : {},
					countedMcOptions : {},
					equalAnswers : {}
				});
				return;
			}

			var correct = [['Correct answers', 'Number of answers'], ['Correct', stats.correct], ['Wrong', stats.wrong]]

			var countedMcOptions = [[question.questionText, "Number of answers"]]
			if (question.questionType === "Multiple choice") {
				var lim = stats.countedMcOptions.length < question.answeroptions.length ? stats.countedMcOptions.length : question.answeroptions.length;
				for (var ans = 0; ans < lim; ans++) {
					//console.log("###########");
					//This is what went wrong during the M4 demo
					//The check below can prevent the same mistake
					//But I don't know how it affects the expected result
					if (question.answeroptions[ans])
						countedMcOptions.push([question.answeroptions[ans].optionText, stats.countedMcOptions[ans]]);
				}
			}

			var equalAnswers = [['Different answers', 'Number of answers']]
			for (ans in stats.equalAnswers) {
				//console.log("###########");
				equalAnswers.push([stats.equalAnswers[ans].ansContent.toString(), stats.equalAnswers[ans].count]);
			}
			callback(null, {
				correct : correct,
				countedMcOptions : countedMcOptions,
				equalAnswers : equalAnswers
			});
		});
	});
}
function getQuestionStats(questionId, sessionId, callback) {
	var answerDB = db.model('Answer', schemas.answerSchema);
	var questionDB = db.model('Question', schemas.questionSchema);
	var optionDB = db.model('Option', schemas.optionSchema);
	var sessionDB = db.model('Session', schemas.sessionSchema);

	//console.log("------------" + sessionId)

	questionDB.findById(questionId).populate('answeroptions').exec(function(err, question) {
		sessionDB.findById(sessionId, function(err, session) {
			answerDB.findOne({
				_id : {
					$in : session.answers
				},
				question : questionId
			}, function(err, answer) {
				if (err) {
					callback(err);
					return;
				}
				if (!answer) {
					callback(null, null);
					return;
				}
				// console.log("#### Answers")
				// console.log(answer);
				// console.log(answer.answers);
				// console.log("--- Answers")
				var result = {
					questionText : "",
					questionOptions : ["Lorem", "Ipsum", "Dolor", "Sit amet"],
					questionType : "Multiple choice",
					total : answer.answers.length,
					correct : 1,
					wrong : 1,
					equalAnswers : null,
					countedMcOptions : null,
				}

				//Set question data
				result.questionText = question.questionText;
				result.questionType = question.questionType;
				result.questionOptions = question.answeroptions;

				//Get array of correct answers
				var correctWrong = getCorrectAnswers(answer.answers, question.answeroptions);
				result.correct = correctWrong[0];
				result.wrong = correctWrong[1];

				// Counting equal answers
				result.equalAnswers = getEqualAnswers(answer.answers);

				// Counting selectet options for multiple choice
				if (question.questionType === "Multiple choice") {
					result.countedMcOptions = getCountedMCOptions(answer.answers, question);
				}

				console.log(result);
				callback(null, result);
			});
		});
	});

}

function getNumberOfAnswers(questionId) {
	answerDB.findOne({
		question : questionId
	}, function(err, answer) {
		return answer.answers.length();

	});
}

function getCorrectAnswers(answers, answerOptions) {
	var correctAnswer = new Array();
	for (var ans = 0; ans < answerOptions.length; ans++) {
		if (answerOptions[ans].correct == true) {
			correctAnswer.push(true);
		} else if (answerOptions[ans].correct == false) {
			correctAnswer.push(false);
		} else if (answerOptions[ans].correct !== undefined) {
			correctAnswer.push(answerOptions[ans].correct);
			//console.log(typeof(answerOptions[ans].correct) +" "+answerOptions[ans].correct);
		}

	}
	console.log("Correct ans " + correctAnswer);

	//Check for correct answers
	var correct = 0;
	var wrong = 0;
	for (var i = 0; i < answers.length; i++) {
		//console.log(answers[i]);
		console.log(answers[i].content + " " + correctAnswer[i] + " " + arrayEqual(answers[i].content, correctAnswer))
		if (arrayEqual(answers[i].content, correctAnswer)) {
			correct++;
		} else {
			wrong++;
		}
	}
	return [correct, wrong];
}

function getEqualAnswers(answers) {
	var equalAnswers = new Array();

	for (var i = 0; i < answers.length; i++) {
		var newAnswer = true;

		//Chack all already grouped equal answers
		for (exAns in equalAnswers) {
			//Anwer already exists
			if (arrayEqual(answers[i].content, equalAnswers[exAns].ansContent)) {
				equalAnswers[exAns].count++;
				newAnswer = false;
			}

		}
		if (newAnswer) {
			equalAnswers.push({
				ansContent : answers[i].content,
				count : 1
			})
		}
	}
	return equalAnswers;
}

function getCountedMCOptions(answers, question) {
	var countetMcOptions = new Array();
	if (question.questionType == "Multiple choice") {
		//init array with 0
		for (var i = 0; i < answers[0].content.length; i++) {
			countetMcOptions.push(0);
		}

		for (var j = 0; j < answers.length; j++) {

			for (var k = 0; k < answers[j].content.length; k++) {
				if (answers[j].content[k] == true)
					countetMcOptions[k]++;
			}

		}
	} else {
		return null;
	}
	return countetMcOptions;
}

function arrayEqual(array1, array2) {
	if (array1.length !== array2.length) {
		console.log(array1.length + " " + array2.length)
		console.log("wrong length")
		return false;
	} else {
		for (var i = 0; i < array1.length; i++) {
			if (array1[i].toString() != array2[i].toString()) {
				console.log( typeof (array1[i]) + " - " + typeof (array2[i]))
				return false;
			}
		}
	}
	return true;
}

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
	var myRegxp = /^([a-zA-Z0-9_-]){3,10}$/;
	if ((req.body.inputUsername.length >0 && myRegxp.test(req.body.inputUsername) == false) || (req.body.inputPassword.length > 0 && myRegxp.test(req.body.inputPassword) == false)) {
		res.render('settings', {
			alert : "Credentials must be only alphanumeric, between 3 and 10 characters",
		});
		return;
	}
	var myRegxp = /\S+@\S+\.\S+/;
	if (req.body.inputEmail.length > 0 && myRegxp.test(req.body.inputEmail) == false) {
		res.render('settings', {
			alert : "Please insert a valid email adress",
		});
		return;
	}
	if (req.body.inputPassword != req.body.inputRePassword && req.body.inputPassword > 2) {
		res.render('settings', {
			alert : "The two passwords are not matching or are too short (min. 6 charrcaters)",
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
	var out = users.findByIdAndUpdate(req.user._id, newValues, function(err, user) {
		if (user) {
			res.render('settings', {
				user: newValues,
				alert: "Acoount successfully updated!",
				type: "success"
			})
		}
	});
	
}

exports.renderuser = function(req, res) {
	if (req.params.username == req.user.name) {
		var users = db.model('User', schemas.userSchema);
		var out = users.findById(req.user._id, function(err, user) {
			if (user) {
				var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
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

