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
	question=preload(loadJSON('slides/example/question1.json'));
	console.log(question);
	var response='<!doctype html><head><link href="http://fonts.googleapis.com/css?family=Open+Sans:regular,semibold,italic,italicsemibold|PT+Sans:400,700,400italic,700italic|PT+Serif:400,700,400italic,700italic" rel="stylesheet" />'+
	'<link href="css/impress-demo.css" rel="stylesheet" /><link rel="shortcut icon" href="favicon.png" /><link rel="apple-touch-icon" href="apple-touch-icon.png" />'+
	'<style type="text/css">'+
	'h1,h2,h3,li,span{'+
	'color: white;}'+
	'h1{'+
	'font-size: 50px;margin-bottom: 20px;font-weight: bold;}'+
   	'span,li{'+
	'font-size: 20px;}'+
    '</style>'+
	'</head><body class="impress-not-supported"><div id="impress"><div id="1" class="step"  data-x="-1024" data-y="0">'+
	        '<h1>'+question.questionText+
		'</h1>';

	for (var i=0;i<question.options.length;i++) {
		response+='<input type="checkbox" name="option'+i+'" value="option'+i+'"><span>'+question.options[i].optionText+'</span><br>'
	}
	response+='</form></div></body></html>';

	
	res.send(200,response);
}

exports.deletequestion=function(req,res) {
	
	var users= db.model('User', schemas.userSchema);
		var out =users.findById(req.user._id, function (err, user) {
		if (user) {
			var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
			slideshowDB.findById(user.slides, function(err, slideshow) {
				for (var i=0;i<slideshow.questions.length;i++) {
					// Jacques: modified
					if (String(slideshow.questions[i])==req.query.id) {
						slideshow.questions.slice(i,i);
					}
				}

			});
			
		} 
		});

	res.redirect('/user/'+req.user.name + '/edit?id='+user.slides);
	
	
	
	
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
	newQuestion.save();
	
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
					//Here for debug purposes
					
					
					
					
					 
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
			console.log(user.slides);
			res.render('user', {arrayslides: user.slides});
		} 
		});
    } else {
        res.redirect('/user/'+req.user.name + '/');
    }
}
