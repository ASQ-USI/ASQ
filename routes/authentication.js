var schemas =require("../models/models.js");



exports.getsingle=function(req, res) {
	res.sendfile(req.path);
	
}

exports.signup=function(req, res) {
	if (req.body.signupusername) {
		console.log('tried to sign up eh');
	}
	console.log('got here');
	var users= db.model('Users', schemas.users);
	var id=0;
	users.find({}, function(err, found) {
		id=found.length;
		console.log(found.length);
		var newUser= new users({
			name: req.body.signupusername,
			password: req.body.signuppassword,
			id: id
		}
		);
	
	
		newUser.save();
		res.render('user', { user: null, message: 'Registration successfull' });
	});
	
}

exports.user= function(req, res) {
	
}