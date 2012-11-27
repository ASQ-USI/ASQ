var schemas =require("../models/models.js");



exports.getsingle=function(req, res) {
	res.sendfile(req.path);
	
}

exports.signup=function(req, res) {
	if (req.body.signupusername) {
	}
	var users= db.model('Users', schemas.users);
	var id=0;
	users.find({}, function(err, found) {
		id=found.length;
		var newUser= new users({
			name: req.body.signupusername,
			password: req.body.signuppassword,
			id: id
		}
		);
	
	
		newUser.save();
		res.render('registered');
	});
	
}
