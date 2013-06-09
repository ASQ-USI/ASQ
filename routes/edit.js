var schemas = require("../models/models.js");
var fs = require("fs");
var moment = require('moment');
var sys = require('sys');
var exec = require('child_process').exec;
var cheerio = require('cheerio');
var asyncblock = require('asyncblock');

/*  --- Edit Slideshow ---*/
function createThumb(slideshow) {
	fs.readFile(slideshow.studentFile, 'utf-8', function(error, data) {
		var ids = [];
		var $ = cheerio.load(data);
		$('.step').each(function() {
			var id = this.attr().id;
			//If slide does not have id, use step-n instead (for url calling)
			if (id == undefined) {
				ids.push("step-" + (ids.length + 1));
			} else {
				ids.push(id);
			}
		});

		asyncblock(function(flow) {
			fs.mkdirSync('slides/thumbs/' + slideshow._id);
			for (var i = 0; i < ids.length; i++) {
				console.log("Calling: /usr/local/w2png -W 1024 -H 768 -T -D slides/thumbs/" + slideshow._id + " -o " + i + " -s 0.3 http://localhost:3000/slidesInFrame/" + slideshow._id + "/?url=" + ids[i]);
				exec("/usr/local/w2png -W 1024 -H 768 -T -D slides/thumbs/" + slideshow._id + " -o " + i + " -s 0.3 http://localhost:3000/slidesInFrame/" + slideshow._id + "/?url=" + ids[i], flow.add());
				flow.wait();
			}
		});

	});
}

exports.editslideshow = function(req, res) {

	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	var questionDB = db.model('Question', schemas.questionSchema);

	slideshowDB.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			/* Load presentation html file */

			fs.readFile(slideshow.teacherFile, 'utf-8', function(error, data) {

				//Array with one field per slide. Each field has questions and stats
				var slides = [];

				$ = cheerio.load(data);
				$('.step').each(function(slide) {
					//Get questions on this slide. Get their text and push it into an array
					var questionsOnSlide = new Array();
					$(this).find('.assessment').each(function(el) {
						var text = $(this).find('.stem').first().text()
						if (text == undefined || text.length == 0) {
							text = "Missing question text";
						}
						questionsOnSlide.push(text);
						//console.log(text);
					});

					//Get stats on this slide. Get their text and push it into an array
					var statsOnSlide = new Array();
					$(this).find('.stats').each(function(el) {
						var text = $(this).find('.stem').first().text()
						if (text == undefined || text.length == 0) {
							text = "Missing question text";
						}
						statsOnSlide.push(text);
						//console.log(text);
					});

					//Push questions and stats on this slide into array
					slides.push({
						questions : questionsOnSlide,
						stats : statsOnSlide
					});
				});

				res.render('edit', {
					title : slideshow.title,
					slides : slides,
					slideshow : slideshow,
				})
			});

		}
	});
}

exports.saveDetails = function(req, res) {
	//console.log("###########wekljfnekrn");
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findByIdAndUpdate(req.params.id, {
		title : req.body.presentationName,
		course : req.body.courseName
	}, function(err, slideshow) {
		if (err)
			throw err;
		res.redirect('/user/edit/' + slideshow._id + '?alert=Slideshow successfully updated &type=succes');
	});
	//res.redirect('/user/' + req.user.name + '?alert=Slideshow successfully updated &type=succes');
}

exports.deleteslideshow = function(req, res) {
	var users = db.model('User', schemas.userSchema);
	var out = users.findById(req.user._id, function(err, user) {
		if (user) {
			for (var i = 0; i < user.slides.length; i++) {
				if (user.slides[i] == req.params.id) {
					user.slides.splice(i, 1);
					user.save();
				}
			}
			var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
			var questionDB = db.model('Question', schemas.questionSchema);
			slideshowDB.findById(req.params.id, function(err, slideshow) {
				questionDB.remove({
					_id : {
						$in : slideshow.questions
					}
				}, function(err, question) {
					if (err) {
						console.log(err);
					}
				});
				slideshow.remove();
				res.redirect('/user/' + req.user.name);
			});

		}
	});
}
/* --- Edit HTML ---*/
exports.edithtml = function(req, res) {
	//console.log(req.params.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.params.id + '/index.html';
			fs.readFile(slideshow.originalFile, 'utf-8', function(error, data) {
				//console.log(req.params.id + " "+ data);
				res.render('edithtml', {
					username : req.user.name,
					html : data,
					id : req.params.id,
					title : slideshow.title,
					alert : false,
					type : null,
					slideshow : slideshow
				});
			});
		}
	});
}

exports.savehtml = function(req, res) {
	//console.log(req.params.id);
	//console.log(req.body.editorvalue);

	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	//Update last edit date
	slideshowDB.findByIdAndUpdate(req.params.id, {
		lastEdit : new Date()
	}, function(err, slides) {
		if (err)
			throw err;
	});
	slideshowDB.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.params.id + '/index.html';
			fs.writeFile(slideshow.originalFile, req.body.editorvalue, function(err) {
				if (err) {
					console.log(err);
				} else {
					//createThumb(req.params.id);
					res.render('edithtml', {
						username : req.user.name,
						html : req.body.editorvalue,
						id : req.params.id,
						title : slideshow.title,
						alert : "Your data has been successfully saved.",
						type : "succes"
					});

				}
			});
		}
	});

}
/* --- Edit Style --- */

exports.editstyle = function(req, res) {
	//console.log(req.params.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.params.id + '/css/style.css';
			fs.readFile(folderHTML, 'utf-8', function(error, data) {
				// console.log(req.params.id + " "+ data);
				res.render('editstyle', {
					username : req.user.name,
					html : data,
					id : req.params.id,
					title : slideshow.title,
					alert : false,
					type : null,
					slideshow : slideshow
				});
			});
		}
	});
}

exports.savestyle = function(req, res) {
	//console.log(req.params.id);
	//console.log(req.body.editorvalue);
	createThumb(req.params.id);
	var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
	//Update last edit date
	slideshowDB.findByIdAndUpdate(req.params.id, {
		lastEdit : new Date()
	}, function(err, slides) {
		if (err)
			throw err;
	});
	slideshowDB.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			var folderHTML = './slides/' + req.params.id + '/css/style.css';
			fs.writeFile(folderHTML, req.body.editorvalue, function(err) {
				if (err) {
					console.log(err);
				}
				res.render('editstyle', {
					username : req.user.name,
					html : req.body.editorvalue,
					id : req.params.id,
					title : slideshow.title,
					alert : "Your data has been successfully saved.",
					type : "succes"
				});

			});
		}
	});

}
/* --- Edit Questions --- */
exports.editquestions = function(req, res) {
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
	var Question = db.model('Question', schemas.slideshowSchema);

	Slideshow.findById(req.params.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			Question.find({
				_id : {
					$in : slideshow.questions
				}
			},
			function(err, questions) {
				console.log(questions);
				res.render('editQuestions', {
					title: slideshow.title,
					slideshow: slideshow,
					questions: questions
				});
			});
		}
	});
}
// var users = db.model('User', schemas.userSchema);
// var out = users.findById(req.user._id, function(err, user) {
// if (err) {
// console.log(err);
// } else {
// if (user) {
//
// var slideshowbelongs = false;
// for (var i = 0; i < user.slides.length; i++) {
// if (user.slides[i] == req.params.id) {
// slideshowbelongs = true;
//
// }
// }
// if (!slideshowbelongs) {
// res.redirect("/user");
// } else {
// var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
// slideshowDB.findById(req.params.id, function(err, slideshow) {
// if (err) {
// console.log(err);
// } else {
// if (slideshow) {
//
// var questions = [];
// var questionDB = db.model('Question', schemas.questionSchema);
// // var optionDB = db.model('Option', schemas.optionSchema);
// for (var i = 0; i < slideshow.questions.length; i++) {
// questionDB.findById(slideshow.questions[i], function(err, question) {
//
// if (question) {
//
// var newquestionob = new Object({
// _id : question._id,
// questionText : question.questionText,
// questionType : question.questionType,
// afterslide : question.afterslide,
// answeroptions : []
// });
//
// for (var j = 0; j < question.answeroptions.length; j++) {
// optionDB.findById(question.answeroptions[j], function(err, option) {
// newquestionob.answeroptions.push(option);
// if (newquestionob.answeroptions.length == question.answeroptions.length) {
// questions.push(newquestionob);
// if (questions.length == slideshow.questions.length) {
// console.log("########################2");
// res.render('editQuestions', {
// arrayquestions : questions,
// username : req.user.name,
// title : slideshow.title
// });
// }
// }
// });
// }
// if (question.answeroptions.length == 0) {
// questions.push(newquestionob);
// if (questions.length == slideshow.questions.length) {
// console.log("########################3");
// res.render('editQuestions', {
// arrayquestions : questions,
// username : req.user.name,
// title : slideshow.title
// });
// }
// }
// }
//
// });
// }
// if (slideshow.questions.length == 0) {
// console.log("########################5");
// res.render('editQuestions', {
// arrayquestions : questions,
// username : req.user.name,
// title : slideshow.title
// });
// }
//
// } else {
// res.redirect("/user");
// }
//
// }
// });
//
// }
//
// }
// }
//
// });

//}

// exports.deletequestion = function(req, res) {
// var users = db.model('User', schemas.userSchema);
// var out = users.findById(req.user._id, function(err, user) {
// if (user) {
// var questionDB = db.model('Question', schemas.questionSchema);
// questionDB.remove({
// _id : req.query.quest
// }, function(err, question) {
// if (err) {
// console.log(err);
// }
// });
// var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
// slideshowDB.findById(req.params.id, function(err, slideshow) {
// for (var i = 0; i < slideshow.questions.length; i++) {
// if (slideshow.questions[i] == req.query.quest) {
// slideshow.questions.splice(i, 1);
// slideshow.save();
//
// }
// }
//
// });
// }
// res.redirect('/user/edit/' + req.params.id);
// });
// }

// exports.addquestion = function(req, res) {
// var questionDB = db.model('Question', schemas.questionSchema);
//
// if (req.query.quest) {
// questionDB.findById(req.query.quest, function(err, question) {
// question.questionText = req.body.questionText;
// question.uestionType = req.body.questionType;
// question.afterslide = req.body.afterslide;
// //question.save();
// var optionDB = db.model('Option', schemas.optionSchema);
// question.answeroptions = [];
// for (var i = 0; i < 256; i++) {
// if (req.param('option' + i) !== undefined && req.param('option' + i) !== "") {
// var newOptionDB = new optionDB({
// optionText : req.param('option' + i),
// });
// newOptionDB.correct = req.param('checkbox' + i) ? true : false;
// newOptionDB.save();
// question.answeroptions.push(newOptionDB._id);
// //newQuestion.save();
// }
//
// }
// question.save();
// console.log("########################1");
// res.redirect('/user/editquestions/' + req.params.id);
//
// });
//
// } else {
// var newQuestion = new questionDB({
// questionText : req.body.questionText,
// questionType : req.body.questionType,
// afterslide : req.body.afterslide
// });
//
// //var optionDB = db.model('Option', schemas.optionSchema);
// for (var i = 0; i < 256; i++) {
// if (req.param('option' + i) !== undefined && req.param('option' + i) !== "") {
// var newOptionDB = new optionDB({
// optionText : req.param('option' + i),
// });
// newOptionDB.correct = req.param('checkbox' + i) ? true : false;
// newOptionDB.save()
// newQuestion.answeroptions.push(newOptionDB._id);
// //newQuestion.save();
// }
//
// }
// newQuestion.save();
//
// var nquestion = 0;
// var slideshowDB = db.model('Slideshow', schemas.slideshowSchema);
// slideshowDB.findById(req.params.id, function(err, slideshow) {
// if (err) {
// console.log(err);
// } else {
// if (slideshow) {
// nquestion = slideshow.questions.length;
// slideshow.questions.push(newQuestion._id);
// slideshow.save();
// }
//
// }
// });
//
// res.redirect('/user/edit' + req.params.id);
// }
//
// }