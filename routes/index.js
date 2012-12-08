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
  , unzip = require('unzip')
  , pfs = require('promised-io/fs')
  , promise = require('promised-io/promise')
  , when = promise.when
  , seq = promise.seq
  , all = promise.all
  , wrench = require('wrench');

exports.index = function(req, res){
    res.render('index', { title: 'Express' });
};

/** Renders the slideshow for admins */
exports.admin = function(req, res) {
    //var wantedUser = req.params.user;
    //getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'Milestone 2', mode:'admin',
                              host:'localhost', port:'3000',
                              user:req.user.name, pass:'&bull;&bull;&bull;&bull;&bull;&bull;',
                              path: path.relative(app.get('views'), 'slides/demo/index.html'),
                              links: [
                                "http://fonts.googleapis.com/css?family=Open+Sans:regular,semibold,italic,italicsemibold|PT+Sans:400,700,400italic,700italic|PT+Serif:400,700,400italic,700italic",
                                "css/impress-demo.css"
                              ]
                             });
    //});
}

/** Renders the slideshow for viewers */
exports.live = function(req, res) {
    //var wantedUser = req.params.user;
    //getCurrentSlides(wantedUser, function (err, user) {
        res.render('slides', {title: 'Milestone 2', mode:'viewer',
                              host:'localhost', port:'3000',
                              user: req.params.user, pass:'To Implement',
                              path: path.relative(app.get('views'), 'slides/demo/index.html'),
                              links: [
                                "http://fonts.googleapis.com/css?family=Open+Sans:regular,semibold,italic,italicsemibold|PT+Sans:400,700,400italic,700italic|PT+Serif:400,700,400italic,700italic",
                                "css/impress-demo.css"
                              ]
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
    var folderPath = 'slides/' + newSlideshow._id;
    pfs.mkdir(folderPath).then(function() {
        fs.createReadStream(req.files.upload.path)

            .on('close', function() {
                var index = pfs.exists(folderPath + '/index.html').then(
                    //Why the FUCK are the success and error handlers inversed here?
                    function() {
                        console.log('error: index.html');
                        reject(new Error('index.html is missing!'));
                        return false;
                    },
                    function() {
                        console.log(folderPath + '/index.html')
                        console.log('index.html ok');
                        return true;
                    }
                );
                var assets = pfs.readFile(folderPath + '/assets.json').then(
                    function(file) {
                        console.log('assets ok');
                        var assets = JSON.parse(file);
                        newSlideshow.title = assets.title;
                        newSlideshow.links = assets.links || [];
                        console.log(assets);
                        return true;
                    },
                    function() {
                        console.log('error: assets.json');
                        return false;
                    }
                )
                var questions = pfs.readFile(folderPath + '/questions.json').then(
                    function(file) {
                        console.log('questions ok');
                        var questions = JSON.parse(file);
                        newSlideshow.questions = questions || [];
                        console.log(questions);
                        return true;
                    },
                    function() {
                        console.log('error: questions.json');
                        newSlideshow.questions = [];
                        return false;
                    }
                )
                var group = all(index, assets, questions);
                var done = when(group,
                    function(result) {
                        console.log('index result is ' + result[0]);
                        console.log('assets result is ' + result[1]);
                        console.log('questions result is ' + result[2]);
                        console.log('all ok');
                        seq([
                            function() {
                                newSlideshow.save();
                            },
                            function() {
                                if (result[1]) pfs.unlink(folderPath + '/assets.json');
                            },
                            function() {
                                if (result[2]) pfs.unlink(folderPath + '/questions.json');
                            },
                            function(){
                                pfs.unlink(req.files.upload.path).then(res.redirect('/user'));
                            }]);
                    },
                    function() {
                        console.log('something went wrong');
                        //TODO: Find a module to remove the (not empty) directory
                        //with the invalid slides without throwing an error becasue
                        //it deleted what it was suppose to delete... FUCK!
                        //or that does not delete everything as wrench-js used
                        //below... FUCK as well
                        wrench.rmdirRecursive(folderPath, function(err){
                            if(err) throw err;
                            pfs.unlink(req.files.upload.path).then(res.redirect('/'));
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