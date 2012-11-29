/** @module routes/index */

/**
   Dummy function for root URL.
   This will be replaced.
 */
var schemas = require('../models/models.js')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Types.ObjectId
  , ejs = require('ejs');

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

/** Renders the slideshow for admins */
exports.admin = function(req, res) {
    var wantedUser = req.params.user;
    getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'demo', mode:'admin', host:'test', port:'3000', user:user, pass:'HG23WX'});
    });
}

/** Renders the slideshow for viewers */
exports.live = function(req, res) {
    var wantedUser = req.params.user;
    getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'demo', mode:'viewer', host:'test', port:'3000', user:'jacques', pass:'HG23WX'});
    });
}

var getCurrentSlides = function(wantedUser, callback) {
    var User = db.model('User', schemas.userSchema);
    User.findOne({ name: wantedUser}, function(err, user) {
        if (err) callback(err);
        if (user.current !== undefined) {
            var Session = db.model('Session', schemas.sessionSchema);
            Session.findById(user.current, function(err, session) {
                if (err) callback(err);
                var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
                Slideshow.findById(Session.slides, function(err, slides) {
                    if (err) callback(err);
                    callback(null, slides);
                });
            });
        }
    });
}