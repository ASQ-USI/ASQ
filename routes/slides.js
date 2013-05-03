/** @module routes/slides
 @author Jacques Dafflon jacques.dafflon@gmail.com
 @description Functions related to the direct interaction with slideshows and
 sessions.
 */
var cheerio = require('cheerio');
var fs = require("fs");
var path = require('path'), schemas = require('../models/models.js');

/** Renders the slideshow for admins */
module.exports.admin = function(req, res) {
	var userId = req.user._id;
	sessionFromUserId(userId, function(err, session) {
		if (err)
			throw err;
		if (!session.id) {
			res.redirect('/user/' + req.user.name + '/?alert=You have no session running!&type=error');
		} else {
			var slideshow = session.slideshow;

			res.render('slides', {
				title : slideshow.title,
				mode : true,
				host : appHost,
				port : app.get('port'),
				user : req.user.name,
				pass : '&bull;&bull;&bull;&bull;&bull;&bull;',
				path : path.relative(app.get('views'), slideshow.path + 'index.html'),
				links : slideshow.links,
				id : session.id,
				date : session.date
			});

		}
	});
}
/** Renders the controll view for admins */
module.exports.adminControll = function(req, res) {
	var userId = req.user._id;
	sessionFromUserId(userId, function(err, session) {
		if (err)
			throw err;
		if (!session.id) {
			res.redirect('/user/' + req.user.name + '/?alert=You have no session running!&type=error');
		} else {
			var slideshow = session.slideshow;
			fs.readFile("./slides/" + slideshow._id + "/index.html", 'utf-8', function(error, data) {
				console.log(data);
				var ids = [];
				$ = cheerio.load(data);
				$('.step').each(function() {
					var id = this.attr().id;
					//If slide does not have id, use step-x instead (for url calling)
					if (id == undefined) {
						ids.push("step-" + (ids.length + 1));
					} else {
						ids.push(id);
					}
				});

				res.render('slidesControll', {
					title : slideshow.title,
					mode : true,
					host : appHost,
					port : app.get('port'),
					user : req.user.name,
					pass : '&bull;&bull;&bull;&bull;&bull;&bull;',
					path : path.relative(app.get('views'), slideshow.path + 'index.html'),
					links : slideshow.links,
					id : session.id,
					date : session.date,
					slidesId : slideshow._id,
					slidesThumbs : ids,
					slideshow: slideshow
				});
			});
		}
	});
}
/** Serve slideshow files for admin **/
module.exports.adminStatic = function(req, res) {
	var userId = req.user._id;
	sessionFromUserId(userId, function(err, session) {
		if (session.slideshow)
			res.sendfile(session.slideshow.path + req.params[0]);
		else
			res.send(404, 'You do not have a session running');
	});
}
/** Renders the slideshow for thumbnail */
module.exports.render = function(req, res) {
	var id = req.params.id;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

	Slideshow.findById(id, function(err, slideshow) {
		if(slideshow){
		res.render('slidesRender', {
			
			path : path.relative(app.get('views'), slideshow.path + 'index.html'),
			links : slideshow.links,
		});
		}else{
			res.send(404, "Slideshow not found");
		}
		
	})
}
/** Serves slides for slideshow rendering */
module.exports.renderStatic = function(req, res) {
	var id = req.params.id;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

	Slideshow.findById(id, function(err, slideshow) {
		res.sendfile(slideshow.path + req.params[0]);
	})
}
/** Renders the slideshow for viewers */
module.exports.live = function(req, res) {
	var userName = req.params.user;
	sessionFromUserName(userName, function(err, session) {
		if (err) {
			if (err.message === 'User does not exist')
				res.send(404, err.message);
			else
				throw err;
			return;
		}
		if (session.slideshow) {
			var slideshow = session.slideshow
			res.render('slides', {
				title : slideshow.title,
				mode : false,
				host : appHost,
				port : app.get('port'),
				user : req.params.user,
				path : path.relative(app.get('views'), slideshow.path + 'index.html'),
				links : slideshow.links,
				id : session.id
			});
		} else {
			res.send(404, 'User does not have a session running');
		}
	});
}
/** Serve slideshow files for viewers **/
module.exports.liveStatic = function(req, res) {
	var userName = req.params.user;
	sessionFromUserName(userName, function(err, session) {
		if (err) {
			if (err.message === 'User does not exist')
				res.send(404, err.message);
			else
				throw err;
			return;
		}
		if (session.slideshow)
			res.sendfile(session.slideshow.path + req.params[0]);
		else
			res.send(404, 'This user does not have a session running');
	});
}
/** Initialize a slideshow (create a new session) for an admin **/
module.exports.start = function(req, res) {
	var slidesId = req.params.id;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
	//Update last played date
	Slideshow.findByIdAndUpdate(slidesId, {
		lastSession : new Date()
	}, function(err, slides) {
		if (err)
			throw err;
	});
	var User = db.model('User', schemas.userSchema);
	Slideshow.findById(slidesId, function(err, slides) {
		if (err || slides === null) {
			//Slides id is wrong
			console.log('Slides id is wrong');
			console.log(err);
			res.redirect(302, '/user/' + req.user.name + '/');
			return;
		}
		if (String(slides.owner) !== String(req.user._id)) {
			//Not allowed to present those slides...
			console.log('ownership problem...')
			console.log('owner: ' + slides.owner);
			console.log('user: ' + req.user._id);
			res.redirect(302, '/user/' + req.user.name + '/');
			return;
		}
		var Session = db.model('Session', schemas.sessionSchema);
		var newSession = new Session();
		newSession.presenter = req.user._id;
		newSession.slides = slides._id;
		newSession.save(function(err) {
			if (err)
				throw err;
			var User = db.model('User', schemas.userSchema);
			User.findByIdAndUpdate(req.user._id, {
				current : newSession._id
			}, function(err, user) {
				res.redirect(302, '/admincontroll');
			});

		});
	});
}
/*
 * Set the current session for an authentificated user t null,
 * effectively stopping the leive session.
 * This require an authentificated user.
 * Note that if the user has no live session ie. his session is set to null,
 * This will still reset it to null, successfully "stopping" a non-existent live
 * session.
 */
module.exports.stop = function(req, res) {
	var User = db.model('User', schemas.userSchema);
	User.findByIdAndUpdate(req.user._id, {
		current : null
	}, function(err, user) {
		if (err)
			throw err;
		//console.log(user.current);
		res.redirect('/user/' + req.user.name + '/?alert=Your session was stopped. You have no session running&type=info');
	});
}
/** Given a userId, find it's current session **/
var sessionFromUserId = function(userId, callback) {
	var User = db.model('User', schemas.userSchema);
	User.findById(userId, function(err, user) {
		if (err)
			callback(err);
		if (!user)
			callback(new Error('User does not exist'));
		else if (user.current) {
			var Session = db.model('Session', schemas.sessionSchema);
			Session.findById(user.current, function(err, session) {
				if (err)
					callback(err);
				//console.log(session);
				var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
				Slideshow.findById(session.slides, function(err, slideshow) {
					if (err)
						callback(err);
					callback(null, {
						id : session._id,
						slideshow : slideshow
					});
				});
			});
		} else {//no session for user
			callback(null, {});
		}
	});
}
/** Given a userName, find it's current session **/
var sessionFromUserName = function(userName, callback) {
	var User = db.model('User', schemas.userSchema);
	//console.log('user');
	//console.log(userName);
	User.findOne({
		name : userName
	}, function(err, user) {
		if (err)
			callback(err);
		//console.log('user');
		//console.log(user);
		if (!user)
			callback(new Error('User does not exist'));
		else if (user.current) {
			var Session = db.model('Session', schemas.sessionSchema);
			Session.findById(user.current, function(err, session) {
				if (err)
					callback(err);
				var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
				Slideshow.findById(session.slides, function(err, slideshow) {
					if (err)
						callback(err);
					callback(null, {
						id : session._id,
						slideshow : slideshow
					});
				});
			});
		} else {//no session for user
			callback(null, {});
		}
	});
}
