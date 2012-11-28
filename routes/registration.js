var schemas =require("../models/models.js");

exports.getsingle=function(req, res) {
	res.sendfile(req.path);
}

//User is added to the database, and page is redirected to confirm the registration
exports.signup=function(req, res) {
	var users= db.model('Users', schemas.users);
	var newUser= new users({
		name: req.body.signupusername,
		password: req.body.signuppassword,
	}
	);
	
	newUser.save();
	res.render('registered');
	
}
