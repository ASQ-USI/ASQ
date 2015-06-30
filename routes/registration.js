var schemas   = require("../models")
var Slideshow   = require("../models/slideshow")
var fs          = require("fs")
var moment      = require('moment')
var check       = require('validator').check
var utils			  = require('../lib/utils/routes');

exports.isValidUserName = function(candidateUser) {
	// Match string between 3 and 12 chars starting with a letter, lower or upper case 
	// and containing only letters (both cases, digits, dashes, underscores and dots.
	var userRegex = /(?=[a-zA-Z])(?=^.{3,12}$)[a-zA-Z0-9_\-\.]*$/;
	return userRegex.test(candidateUser);

}

exports.isValidPassword = function(candidatePass) {
	// Match a string between 8 and 30 chars
	// and containing only letters (both cases), digits and the following characters: ! @ # % : _ ( ) $ ^ & * - . ?
	// It also must contain at least one upper case letter, one lower case and one digit and it cannot contain spaces.
	var passwordRegex = /(?=^.{8,30}$)(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?!.*\s)[0-9a-zA-Z:!@#%_\(\)\$\^\&\*\-\.\?]*$/;
	return passwordRegex.test(candidatePass);
}

exports.isValidEmail = function(candidateEmail) {
	return check(candidateEmail).len(6, 64).isEmail();
}

exports.getsingle = function(req, res) {
	res.sendfile(req.path);
}
//User is added to the database, and page is redirected to confirm the registration
exports.signup = function(req, res) {
	// Empty Fields
	if (req.body.signupusername == "" || req.body.signuppassword == "") {
		res.render('signIn', {
			message : "Missing credentials",
			fromsignup : true
		});
		return;
	}

	// Username syntax
	if (!exports.isValidUserName(req.body.signupusername)) {
		res.render('signIn', {
			message : "User name should be between 3 and 12 characters and only contain letters, digits or . - _.",
			fromsignup : true
		});
		return;
	}
	
	// Email
	if (!exports.isValidEmail(req.body.signupemail)) {
		res.render('signIn', {
			message : "Please insert a valid email adress",
			fromsignup : true
		});
		return;
	}

	//Password
	if (!exports.isValidPassword(req.body.signuppassword)) {
		res.render('signIn', {
			message : "Password should be betwwen 8 and 30 characters and have at least a lower case letter, an upper case letter and a digit. It can contain the following symbols: ! @ # % : _ ( ) $ ^ & * - . ?",
			fromsignup : true
		});
		return;
	}

	if (req.body.signuppassword != req.body.signuppasswordconfirm) {
		res.render('signIn', {
			message : "The two passwords are not matching",
			fromsignup : true
		});
		return;
	}

	// Username availability and saving
	var User = db.model('User', schemas.userSchema);
	var out = User.findOne({
		username : req.body.signupusername
	}, function(err, user) {
		if (user) {
			res.render('signIn', {
				message : "Username already taken",
				fromsignup : true
			});
		} else {
			var newUser = new User({
				username : req.body.signupusername,
				password : req.body.signuppassword,
				email : req.body.signupemail
			});
			newUser.save();
			res.render('signIn', {message: "Account was created"} );
		}
	});

}

exports.checkusername = function(req, res) {
	//Send invalid username if the format is wrong
	if (!exports.isValidUserName(req.params.username)) {
		res.send(200, '2');
	}

	User = db.model('User', schemas.userSchema);
	var response = '0';
	var out = User.findOne({
		username : req.params.username
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

//MOVED
exports.settings = function(req, res){
	var User = db.model('User', schemas.userSchema);
	var out = User.findById(req.user._id, function(err, user) {
		if (user) {
			res.render('settings', {
				user: user
			})
			
		}
	});
}
 //MOVED
exports.saveSettings = function(req, res){
	// Username
	if (req.body.inputUsername.length > 0 && !exports.isValidUserName(req.body.inputUsername)) {
		res.render('settings', {
			alert : "User name should be between 3 and 12 characters and only contain letters, digits or . - _.",
		});
		return;
	}
	
	// Password Syntax
	if (req.body.inputPassword.length > 0 && !exports.isValidPassword(req.body.inputPassword)) {
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
	if (req.body.inputEmail.length > 0 && !exports.isValidEmail(req.body.inputEmail)) {
		res.render('settings', {
			alert : "Please insert a valid email adress",
		});
		return;
	}

	var User = db.model('User', schemas.userSchema);
	//Test if username already exists
	var out = User.findOne({
		username : req.body.inputUsername
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
	var out = User.findById(req.user._id, function(err, user) {
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
	
}

//MOVED
exports.renderuser = function(req, res) {
	if (req.params.username == req.user.username) {
		var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
		Slideshow.find({
			owner : req.user._id
		}, '_id title course lastSession lastEdit',
		function(err, slides) {
			if (err){throw err;}

			var slidesByCourse = null; //to evaluate as false in dustjs

			if (slides && slides.length > 0) {
				slidesByCourse = {};
				for (var i = 0; i < slides.length; i++) {
					var slideshow = slides[i].toJSON();
					if (!slidesByCourse.hasOwnProperty(slideshow.course)) {
						slidesByCourse[slideshow.course] = [];
					}
					slideshow.lastEdit = moment( slideshow.lastEdit)
							.format('DD.MM.YYYY HH:mm');
					slideshow.lastSession = moment( slideshow.lastSession)
							.format('DD.MM.YYYY HH:mm');
					slidesByCourse[slideshow.course].push(slideshow);
				}
			}

			var type = utils.getAlertTypeClass(req);

			res.render('user', {
				slidesByCourses: slidesByCourse,
				username : req.user.username,
				host : ASQ.appHost,
				port : app.get('port'),
				id : req.user.current,
				alert : req.query.alert,
				type : type,
				session : req.user.current
			});
		});
	} else {
		res.redirect('/user/' + req.user.username + '/');
	}
}
