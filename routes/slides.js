/** @module routes/slides
 @author Jacques Dafflon jacques.dafflon@gmail.com
 @description Functions related to the direct interaction with slideshows and
 sessions.
 */
var cheerio  = require('cheerio')
, fs         = require("fs")
, path       = require('path')
, schemas    = require('../models')
, asyncblock = require('asyncblock')
, lib 		   = require('../lib');
, appLogger  = lib.logger.appLogger;

/** Renders the slideshow for admins */
module.exports.admin = function(req, res) {
  var userId = req.user._id;

  sessionFromUserId(userId, function(err, session) {
    if (err) throw err;
    if (!session || !session.id) {
      res.redirect('/user/' + req.user.name + 
      	'/?alert=You have no session running!&type=error');
      return;
    }

    var slideshow = session.slides;
    res.render(slideshow.teacherFile, { 
    	title : slideshow.title,
    	mode  : 'admin',
      host  : appHost,
      port  : app.get('port'),
      user  : req.user.name,
      pass  : '&bull;&bull;&bull;&bull;&bull;&bull;',
      path  : path.relative(app.get('views'), slideshow.path + 'index.html'),
      links : slideshow.links,
      id    : session.id,
      date  : session.date
    });
  });
}

/** Renders the controll view for admins */
module.exports.adminControll = function(req, res) {
	console.log("adminControll")
	var userId = req.user._id;
	sessionFromUserId(userId, function(err, session) {
		if (err)
			throw err;
		if (!session.id) {
			res.redirect('/user/' + req.user.name + '/?alert=You have no session running!&type=error');
		} else {
			var slideshow = session.slides;
			fs.readFile(slideshow.teacherFile, 'utf-8', function(error, data) {
				//console.log(data);
				var ids = [];
				var presentationSkeleton;
				//Array with one field per slide. Each field has questions and stats
				var slides = [];
				
				$ = cheerio.load(data);
				$('.step').each(function() {
					//Get questions on this slide. Get their text and push it into an array
					var questionsOnSlide = new Array();
					$(this).find('.assessment').each(function(el) {
						var text =  $(this).find('.stem').first().text()
						if(text == undefined || text.length == 0){
							text = "Missing question text";
						}
						questionsOnSlide.push(text);
						//console.log(text);
					});
					
					//Get stats on this slide. Get their text and push it into an array
					var statsOnSlide = new Array();
					$(this).find('.stats').each(function(el) {
						var text =  $(this).find('.stem').first().text()
						if(text == undefined || text.length == 0){
							text = "Missing question text";
						}
						statsOnSlide.push(text);
						//console.log(text);
					});
					
					var id = this.attr().id;
					//If slide does not have id, use step-x instead (for url calling)
					if (id == undefined) {
						id =="step-" + (ids.length + 1);
					} 
					ids.push(id);
					slides.push({
						id: id,
						questions: questionsOnSlide,
						stats: statsOnSlide
					});

				});
				presentationSkeleton ='<div class="step" id="'+ ids.join('"></div><div class="step" id="') + '"></div>';

				res.render('slidesControll', {
					title : slideshow.title,
					mode  : true,
					host  : appHost,
					port  : app.get('port'),
					user  : req.user.name,
					pass  : '&bull;&bull;&bull;&bull;&bull;&bull;',
					id    : session.id,
					date  : session.date,
					slidesId     : slideshow._id,
					slidesThumbs : slides,
					slideshow    : slideshow, 
					presenationSkeleton : presentationSkeleton,
				});
			});
		}
	});
}

/** Serve slideshow files for admin **/
module.exports.adminStatic = function(req, res) {
	console.log("adminStatic")
	var userId = req.user._id;
	sessionFromUserId(userId, function(err, session) {
		if (session.slides)
			res.sendfile(session.slides.path + req.params[0]);
		else
			res.send(404, 'You do not have a session running');
	});
}

//MOVED
/** Renders the slideshow for thumbnail */
module.exports.render = function(req, res) {
	var id = req.params.id;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

	Slideshow.findById(id, function(err, slideshow) {
		if(slideshow){
			res.sendfile(slideshow.originalFile);
		
		}else{
			res.send(404, "Slideshow not found");
		}
	});
}

/** Shows a splash screen to start presentation */
// module.exports.splashScreen = function (req, res) {
	// var userId = req.user._id;
	// sessionFromUserId(userId, function(err, session) {
		// if (err)
			// throw err;
		// if (!session.id) {
			// res.redirect('/user/' + req.user.name + '/?alert=You have no session running!&type=error');
		// } else {
			// var slideshow = session.slideshow;
  			// res.render('slidesSplashScreen',{
  					// title : slideshow.title,
					// host : appHost,
					// port : app.get('port'),
					// user : req.user.name}
					// );
  		// }
  // });
// }

/** Serves slides for slideshow rendering */
module.exports.renderStatic = function(req, res) {
	var id = req.params.id;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

	Slideshow.findById(id, function(err, slideshow) {
		res.sendfile(slideshow.path + req.params[0]);
	});
}

/** Serves thumbnails */
module.exports.serveThumbs = function(req, res) {
	var id = req.params.id;
	var file = req.params.file;
	var Slideshow = db.model('Slideshow', schemas.slideshowSchema);

	Slideshow.findById(id, function(err, slideshow) {
		res.sendfile('slides/thumbs/' + id + '/' + file);
	});
}

/** Renders the slideshow for viewers */
module.exports.live = function(req, res) {
  var userName = req.params.user
  , mode = (req.query.mode && (req.query.mode=='viewer' || req.query.mode=='invisible'))
  	 ? req.query.mode : 'viewer';

  console.log('the master said: '+ mode)

  lib.slidesUtils.sessionFromUsername(userName, function (err, session) {
    if (err) {
      if (err.message === 'User does not exist')
      	res.send(404, err.message);

      else { throw err; }
      return;
    }

    if (session.slides) {
        var slideshow = session.slides;
        res.render(slideshow.studentFile, {
        	title : slideshow.title,
        	mode  : mode,
          host  : appHost,
          port  : app.get('port'),
          user  : req.params.user,
          path  : path.relative(app.get('views'), slideshow.path + 'index.html'),
          links : slideshow.links,
          id    : session.id
        });

    } else {
    	res.send(404, 'User does not have a session running');
    }
  });
}

/** Serve slideshow files for viewers **/
module.exports.liveStatic = function(req, res) {
	var userName = req.params.user;
	lib.slidesUtils.sessionFromUsername(userName, function(err, session) {
		if (err) {
			if (err.message === 'User does not exist') {
				res.send(404, err.message);
			
			} else { throw err; }
			return;
		}

		if (session.slides) {
			res.sendfile(session.slides.path + req.params[0]);

		} else {
			res.send(404, 'This user does not have a session running');
		}
	});
}

/** Initialize a slideshow (create a new session) for an admin **/
module.exports.start = function(req, res) {
	var slidesId = req.params.id;

	asyncblock(function(flow) {

		//Error Handling
		flow.errorCallback = function errorCallback(err) {
			appLogger.error("Presentation Start\n" + err);
			res.redirect(302, '/user/' + req.user.name 
				+ '/?alert=Something went wrong. The Great ASQ Server said: '
				+ err + '&type=error');
			return;
		}

		//Find slideshow
		var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
		Slideshow.findOne({ _id: slidesId, owner: req.user._id }, flow.set('slideshow'));

		//Instantiate a new session
		var Session = db.model('Session', schemas.sessionSchema);
		var newSession = new Session();
		newSession.presenter = req.user._id;
		newSession.slides = flow.get('slideshow')._id;
		newSession.authLevel = (Session.schema.path('authLevel').enumValues
			.indexOf(req.query.al) > -1) ? req.query.al : "public";
		
		//Save the new session
		newSession.save(flow.add());

		//Generate the white list for the level
		lib.slidesUtils.generateWhitelist[newSession.authLevel]
			(newSession._id, newSession.presenter, flow.add());

		//Update the suer's current session
		var User = db.model('User', schemas.userSchema);
		User.findByIdAndUpdate(req.user._id, { current : newSession._id }, flow.add());

		//Update slideshow's last presnetation to now
		flow.get('slideshow').lastSession = new Date();
		flow.get('slideshow').save(flow.add());

		//Wait to finish and redirect
		flow.wait();
		appLogger.info("Starting new " + newSession.authLevel + " session");
		res.redirect(302, '/adminControll');
	});
}

/*
 * Set the current session for an authenticated user to null,
 * effectively stopping the live session.
 * This require an authentificated user.
 * Note that if the user has no live session ie. his session is set to null,
 * This will still reset it to null, successfully "stopping" a non-existent live
 * session.
 */
module.exports.stop = function(req, res) {
	var User = db.model('User', schemas.userSchema);
	User.findByIdAndUpdate(req.user._id, {
		current : null
	}, {
		new : false
	}, function(err, user) {
		if (err) { throw err; }
		if (!user) {
			res.redirect('/user/' + req.user.name 
			+ '/?alert=Something went wrong. The Great ASQ Server said: User not found');
		}
		
		var WhitelistEntry = db.model('WhitelistEntry', schemas.whitelistEntrySchema);
		WhitelistEntry.remove({ session : user.current }, function(err) {
			if (err) { throw err; }
			res.redirect('/user/' + req.user.name 
			+ '/?alert=Your session was stopped. You have no session running&type=info');
		});
	});
}

/** Given a userId, find it's current session **/
var sessionFromUserId = function(userId, callback) {
	var User = db.model('User', schemas.userSchema);
	User.findById(userId, function(err, user) {
		if (err) { callback(err); }
		
		if (!user) { 
			callback(new Error('User does not exist'));

		} else if (user.current) {
			var Session = db.model('Session', schemas.sessionSchema);
			Session.findById(user.current).populate('slides')
				.exec(function(err, session) {
					if (err) { return callback(err); }

					callback(null, session);
			});

		} else { //no session for user
			callback(null, {});
		}
	});
}
