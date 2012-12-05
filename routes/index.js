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
                                    owner: req.user._id
                                    });
    var path = 'slides/' + newSlideshow._id;
    fs.mkdir(path, function(err) {
        if (err) throw err;
        fs.createReadStream(req.files.upload.path)
            .on('close', function(){
                //Process index.html if none, delete everything notify user
                fs.rename(path + '/index.html', path + '/index.ejs', function(err) {
                    if (err) throw err; //Must handle ENOENT
                    //Process assets.json if none, delete everything notify user
                    //What if the file is very large and overflows...?
                    fs.readFile(path + '/assets.json', function(err, file) {
                        if (err) throw err; //Must handle ENOENT
                        var assets = JSON.parse(file);
                        newSlideshow.title = assets.title;
                        newSlideshow.links = assets.links || [];
                        //Process questions.json if none, skip.
                        //What if the file is very large and overflows...?
                        fs.readFile(path + '/questions.json', function(err, file2){
                            if (err) throw err; //Must handle ENOENT
                            var questions = JSON.parse(file2);
                            newSlideshow.questions = questions || [];
                            //Save the Slideshow entry in the db
                            newSlideshow.save(function(err) {
                                if (err) throw err;
                                //Delete zip archive
                                fs.unlink(req.files.upload.path, function(err) {
                                    if (err) throw err;
                                    //Delete assets.json
                                    fs.unlink(path + '/assets.json', function(err) {
                                        if (err) throw err;
                                        //Delete questions.json
                                        fs.unlink(path + '/questions.json', function(err) {
                                            if (err) throw err;
                                            //Redirect to user page, with success.
                                            res.redirect('/user'); // Must add notifications
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
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