/** @module routes/index */

/**
   Dummy function for root URL.
   This will be replaced.
 */
var schemas = require('../models/models.js')
  , mongoose = require('mongoose')
  , ObjectId = mongoose.Types.ObjectId
  , ejs = require('ejs')
  , path = require('path')
  , fs = require('fs')
  , unzip = require('unzip');

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

/** Renders the slideshow for admins */
exports.admin = function(req, res) {
    //console.log(req);
    console.log(path.relative(app.get('views'), 'slides/demo/'));
    //var wantedUser = req.params.user;
    //getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'demo', mode:'admin',
                              host:'localhost', port:'3000',
                              user:req.user.name, pass:'&bull;&bull;&bull;&bull;&bull;&bull;',
                              path: path.relative(app.get('views'), 'slides/demo/')
                             });
    //});
}

/** Renders the slideshow for viewers */
exports.live = function(req, res) {
    //var wantedUser = req.params.user;
    //getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'demo', mode:'viewer',
                              host:'localhost', port:'3000',
                              user: req.params.user, pass:'To Implement',
                              path: path.relative(app.get('views'), 'slides/demo/')
                             });
    //});
}

exports.showUpload = function(require, res) {
    res.render('upload');
}

exports.upload = function(req, res) {
    var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
    var newSlideshow = new Slideshow({
                                    title:req.files.upload.name,
                                    owner: req.user.name
                                    });
    fs.mkdir('slides/' + newSlideshow._id, function(err) {
        if (err) throw err;
        fs.createReadStream(req.files.upload.path)
            .on('close', function(){
                /*  This where we have to:
                 *  1. Process index.[html|ejs]
                 *  2. Process assets.json
                 *  3. Procses questions.json
                 *  4. Save the Slides entry in the db
                 *  5. Redirect to user page
                 * ALSO, for some reason, this is called a twice, after some time, for some reason...
                 */
                console.log('done');
            })
            .pipe(unzip.Extract({ path:'slides/' + newSlideshow._id }));
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