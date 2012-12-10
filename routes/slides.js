/** @module routes/slides */

var path = require('path')
  , schemas = require('../models/models.js');

/** Renders the slideshow for admins */
module.exports.admin = function(req, res) {
    var userId = req.user._id;
    sessionFromUserId(userId, function(err, session) {
        if (err) throw err;
        var slideshow = session.slideshow;
         res.render('slides', {title: slideshow.title, mode:'admin',
                              host: appHost, port: app.get('port'),
                              user:req.user.name, pass:'&bull;&bull;&bull;&bull;&bull;&bull;',
                              path: path.relative(app.get('views'), slideshow.path + 'index.html'),
                              links: slideshow.links,
                              id: session.id
                             });
    });
}

/** Serve slideshow files for admin **/
module.exports.adminStatic = function(req, res) {
    var userId = req.user._id;
    sessionFromUserId(userId, function(err, session) {
        res.sendfile(session.slideshow.path + req.params[0]);
    });
}

/** Renders the slideshow for viewers */
module.exports.live = function(req, res) {
    var userName = req.params.user;
    sessionFromUserName(userName, function (err, session) {
        if (err) throw err;
        var slideshow = session.slideshow
        res.render('slides', {title: slideshow.title, mode:'viewer',
                              host:appHost, port: app.get('port'),
                              user: req.params.user,
                              path: path.relative(app.get('views'), slideshow.path + 'index.html'),
                              links: slideshow.links,
                              id: session.id
                             });
    });
}

/** Serve slideshow files for viewers **/
module.exports.liveStatic = function(req, res) {
    var userName = req.params.user;
    sessionFromUserName(userName, function(err, session) {
        res.sendfile(session.slideshow.path + req.params[0]);
    });
}

/** Initialize a slideshow (create a new session) for an admin **/
module.exports.start = function(req, res) {
    var slidesId = req.params.id;
    var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
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
            if (err) throw err;
            var User = db.model('User', schemas.userSchema);
            User.findByIdAndUpdate(req.user._id, {current: newSession._id}, function(err, user) {
                res.redirect(302, '/admin');
            });

        });
    });
}

/** Given a userId, find it's current session **/
var sessionFromUserId = function(userId, callback) {
    var User = db.model('User', schemas.userSchema);
    User.findById(userId, function(err, user) {
        if (err) callback(err);
        if (user.current !== null) {
            var Session = db.model('Session', schemas.sessionSchema);
            Session.findById(user.current, function(err, session) {
                if (err) callback(err);
                console.log(session);
                var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
                Slideshow.findById(session.slides, function(err, slideshow) {
                    if (err) callback(err);
                    callback(null, {id: session._id, slideshow:slideshow});
                });
            });
        }
    });
}

/** Given a userName, find it's current session **/
var sessionFromUserName = function(userName, callback) {
    var User = db.model('User', schemas.userSchema);
    console.log('user');
    console.log(userName);
    User.findOne({ name: userName }, function(err, user) {
        if (err) callback(err);
        console.log(user);
        if (user.current !== null) {
            var Session = db.model('Session', schemas.sessionSchema);
            Session.findById(user.current, function(err, session) {
                if (err) callback(err);
                var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
                Slideshow.findById(session.slides, function(err, slideshow) {
                    if (err) callback(err);
                    callback(null, {id: session._id, slideshow:slideshow});
                });
            });
        }
    });
}