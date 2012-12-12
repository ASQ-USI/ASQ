var schemas =require("../models/models.js");
var fs = require("fs");

exports.getsingle=function(req, res) {
	res.sendfile(req.path);
}

//User is added to the database, and page is redirected to confirm the registration
exports.signup=function(req, res) {
	if (req.body.signupusername=="" || req.body.signuppassword=="") {
		res.render('index', {message: "Missing credentials", fromsignup:'true' });
		return;
	}
	var myRegxp = /^([a-zA-Z0-9_-]){3,10}$/;
	if(myRegxp.test(req.body.signupusername) == false|| myRegxp.test(req.body.signuppassword) == false)
	{
	    res.render('index', { message: "Credentials must be only alphanumeric, between 3 and 10 characters", fromsignup:'true' });
	    return;
	}
	var myRegxp = /\S+@\S+\.\S+/;
	if(myRegxp.test(req.body.signupemail) == false)
	{
	    res.render('index', { message: "Please insert a valid email adress", fromsignup:'true' });
	    return;
	}
	if (req.body.signuppassword!=req.body.signuppasswordconfirm) {
		res.render('index', {message: "The two passwords are not matching", fromsignup:'true' });
		return;
	}


	var users= db.model('User', schemas.userSchema);
	var out =users.findOne({ name: req.body.signupusername }, function (err, user) {
        if (user) {
		res.render('index', {message: "Username already taken", fromsignup:'true'  });
	} else {
		var newUser= new users({
		name: req.body.signupusername,
		password: req.body.signuppassword,
		email: req.body.signupemail
	}
	);
		newUser.save();
		res.render('registered', null);
	}
	});	

}





exports.checkusername=function(req,res) {
	User= db.model('User', schemas.userSchema);
	var response='0';
	var out =User.findOne({ name: req.params.username }, function (err, user) {
        if (user) {
		response='1';
	}
	res.send(200,response);
});
}

function loadJSON(filePath){
	var file = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(file);
}

function preload(jsonFile) {
	var question = new Object({
		questionText:jsonFile.questionText,
		questionType: jsonFile.questionType,
		afterslide: jsonFile.afterslide,
		options: jsonFile.options
	});
	return question;
	

}



exports.parsequestion=function(req,res) {
	question=preload(loadJSON('slides/example/question2.json'));
	console.log(question);
	
	res.render('questionTemplate',{questionObj: question, mode:'admin'});
	
}

exports.sendanswer=function(req,res) {
	question=preload(loadJSON('slides/example/question1.json'));
	console.log(question);
	
	
	res.render('answerTemplate',{questionObj: question, mode:'admin'});
	
}

exports.deletequestion=function(req,res) {
	
	var users= db.model('User', schemas.userSchema);
		var out =users.findById(req.user._id, function (err, user) {
		if (user) {
			var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
			slideshowDB.findById(req.query.id, function(err, slideshow) {
				for (var i=0;i<slideshow.questions.length;i++) {
					// Jacques: modified
					console.log(slideshow.questions[i]);
					console.log(req.query.quest);

					if (String(slideshow.questions[i])==String(req.query.quest)) {
						slideshow.questions.slice(i,1);
						slideshow.save();

					}
				}

				
			});
			
			
		}
		res.redirect('/user/'+req.user.name + '/edit?id='+req.query.id);
		});
		
	
	
	
	
	
}

exports.addquestion=function(req,res) {
	
	options=[];
	var optionDB=db.model('Option', schemas.optionSchema);
	var optionsDB=[];
	for (var i=0; i<256; i++) {
		if (req.param('option'+i)) {
			
			options[i-1]= new Object( {
				optionText:req.param('option'+i),
				correct:"no"
			});
			if (req.param('checkbox'+i)) {
				options[i-1].correct="yes";
			}
			var newOptionDB=new optionDB( {
				optionText: options[i-1].optionText,
				correct: options[i-1].correct
			});
			optionsDB.push(newOptionDB);
			} else {
				if (i>0) {
					break;
				}
			}

	}
	var questionDB= db.model('Question', schemas.questionSchema);
	var newQuestion=new questionDB({
		questionText:req.body.questionText,
		questionType: req.body.questionType,
		afterslide: req.body.afterslide,
		answeroptions: optionsDB
	});

	
	var nquestion=0;
	var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById(req.query.id, function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			if (slideshow) {
				nquestion=slideshow.questions.length;
				slideshow.questions.push(newQuestion._id);
				slideshow.save();
				newQuestion.save();
			}
			
		}
	}
		);
	res.redirect('/user/'+req.user.name + '/edit?id='+req.query.id);
	
	
}

exports.editslideshow=function(req,res) {
	var users= db.model('User', schemas.userSchema);
	var out =users.findById(req.user._id, function (err, user) {
		if (err) {
			console.log(err);
		} else {
			if (user) {
		
				var slideshowbelongs=false;
				for (var i=0; i<user.slides.length;i++) {
					if (user.slides[i]==req.query.id) {
						slideshowbelongs=true;
						
					}
				}
				if (!slideshowbelongs) {
					res.redirect("/user");
				} else {
					var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
					slideshowDB.findById(req.query.id, function(err, slideshow) {
						if (err) {
							console.log(err);
						} else {
							if (slideshow) {
								// Jacques: Modified
								var Question = db.model('Question', schemas.questionSchema);
								Question.find({_id: { $in: slideshow.questions}}, function(err, questions) {
									//Should be moved here
									res.render('edit', {arrayquestions: questions});
								});
							} else {
								res.redirect("/user");
							}
							
						}
					}
					);

				}
			
				
			}
		}
         
	});
		
	
	
}

exports.renderuser=function(req,res) {
	if (req.params.username==req.user.name) {
		var users= db.model('User', schemas.userSchema);
		var out =users.findById(req.user._id, function (err, user) {
		if (user) {
			slides=[];
			var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
			slideshowDB.find({ _id: { $in : user.slides } }, function(err, slides) {
				if (err) throw err;
				var type = req.query.type &&
						   /(succes|error|info)/g.test(req.query.type) ?
				           'alert-' + req.query.type : '';
				res.render('user', {arrayslides: slides, alert: req.query.alert, type:type, session: user.current});
			});
			
		} 
		});
    } else {
        res.redirect('/user/'+req.user.name + '/');
    }
}
