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



function loadJSON(filePath){
	var file = fs.readFileSync(filePath, 'utf8');
	return JSON.parse(file);
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


function preload(jsonFile, n) {
	
	var questions = [];
	var question;
	for (var i = 0; i < n; i++) {
		question = new Object();
		question.text = jsonFile[i].text;
		question.options = jsonFile[i].options;
		question.correct = jsonFile[i].correct;
		question.id = i;
		questions[i] = question;
	}
	
	return questions;

}

exports.parsequestion=function(req,res) {
	questions=preload(loadJSON('question.json'),1);
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
	        '<h1>'+questions[0].text+
		'</h1>';

	for (var i=0;i<questions[0].options.length;i++) {
		response+='<input type="checkbox" name="option'+i+'" value="option'+i+'"><span>'+questions[0].options[i].text+'</span><br>'
	}
	response+='</form></div></body></html>';

	
	res.send(200,response);
}

exports.addquestion=function(req,res) {
	/**
	var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
	var newslideShow= new slideshowDB( {
		title: "About Javascript",
		questions:[]
	});
	newslideShow.save();
	console.log(newslideShow._id);
	**/
	
	
	
	question = new Object();
	question.questionText = req.body.questionText;
	question.questionType = req.body.questionType;
	question.afterslide = req.body.afterslide;
	question.options=[];
	var optionDB=db.model('Option', schemas.optionSchema);
	var optionsDB=[];
	for (var i=0; i<256; i++) {
		if (req.param('option'+i)) {
			
			question.options[i-1]= new Object( {
				optionText:req.param('option'+i),
				correct:"no"
			});
			if (req.param('checkbox'+i)) {
				question.options[i-1].correct="yes";
			}
			var newOptionDB=new optionDB( {
				optionText: question.options[i-1].optionText,
				correct: question.options[i-1].correct
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
		questionText:question.questionText,
		questionType: question.questionType,
		afterslide: question.afterslide,
		answeroptions: optionsDB
	});
	newQuestion.save();
	
	var nquestion=0;
	var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
	slideshowDB.findById('50c5b03c253791cd04000003', function(err, slideshow) {
		if (err) {
			console.log(err);
		} else {
			if (slideshow) {
				nquestion=slideshow.questions.length;
				slideshow.questions.push(newQuestion);
				slideshow.save();
			}
			
		}
	}
		);
	
	var questionstring=JSON.stringify(question);
	fs.writeFile("slides/example/question"+(nquestion+1)+".json", questionstring, function(err) {
		if(err) {
		    console.log(err);
		} 
	    }); 
	
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
					if (user.slides[i]._id==req.query.id) {
						slideshowbelongs=true;
						
					}
				}
				//Set for now to true because no user has any slideshow for now
				slideshowbelongs=true;
				if (!slideshowbelongs) {
					res.redirect("/");
				} else {
					var slideshowDB=db.model('Slideshow', schemas.slideshowSchema);
					slideshowDB.findById('50c5b03c253791cd04000003', function(err, slideshow) {
						if (err) {
							console.log(err);
						} else {
							if (slideshow) {
								//Should be moved here
								res.render('edit', {arrayquestions: slideshow.questions});
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


