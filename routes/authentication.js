var schemas =require("../models/models.js");



exports.getsingle=function(req, res) {
	res.sendfile(req.path);
	
}

exports.signup=function(req, res) {
	var users= db.model('Users', schemas.users);
	var id=0;
	users.find({}, function(err, found) {
		id=found.length;
		console.log(found.length);
		var newUser= new users({
			name: req.body.username,
			password: req.body.password,
			id: id
		}
		);
	
		newUser.save();
		res.render('user', { user: newUser, message: 'Registration successfull' });
	});
	
}

exports.user= function(req, res) {
	
}