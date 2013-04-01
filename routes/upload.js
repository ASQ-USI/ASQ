/** @module routes/upload */

var schemas = require('../models/models.js')
  , fs = require('fs')
  , unzip = require('unzip')
  , pfs = require('promised-io/fs')
  , promise = require('promised-io/promise')
  , when = promise.when
  , seq = promise.seq
  , all = promise.all
  , wrench = require('wrench');

module.exports.show = function(req, res) {
    res.render('upload', {username: req.user.name});
}

module.exports.post = function(req, res) {
    var Slideshow = db.model('Slideshow', schemas.slideshowSchema);
    var newSlideshow = new Slideshow({
                                    title:req.files.upload.name,
                                    owner: req.user._id
                                    });
    var folderPath = './slides/' + newSlideshow._id;
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
                        newSlideshow.course = assets.course || "General course";
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
                        for (var i=0; i<questions.length;i++) {
                             var questionDB= db.model('Question', schemas.questionSchema);
                             var newQuestion=new questionDB({
                                    questionText:questions[i].questionText,
                                    questionType: questions[i].questionType,
                                    afterslide: questions[i].afterslide
                            });
                            newQuestion.save();
                            newSlideshow.questions.push(newQuestion._id);
                            
                            var optionDB=db.model('Option', schemas.optionSchema);
                            for (var j=0;j< questions[i].options.length;j++) {
                                newOptionDB=new optionDB( {
                                    optionText: questions[i].options[j].optionText,
                                    correct: questions[i].options[j].correct
                                });
                                newOptionDB.save();
                                newQuestion.answeroptions.push(newOptionDB._id);
                                newQuestion.save();
                                
                            }
                            
                           
                        } 
                        
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
                            function() {
                                var User = db.model('User', schemas.userSchema);
                                User.findByIdAndUpdate(req.user._id, { $push: {slides : newSlideshow._id } }, function(err, user) {
                                    pfs.unlink(req.files.upload.path).then(res.redirect('/user/'));
                                });
                            }]);
                    },
                    function() {
                        console.log('something went wrong');
                        //TODO: Find a module to remove the (not empty) directory
                        //with the invalid slides without throwing an error becasue
                        //it deleted what it was suppose to delete... FUCK!
                        //or that does not delete everything as wrench-js used
                        //below... FUCK as well
                        //wrench.rmdirRecursive(folderPath, function(err){
                        //    if(err) throw err;
                            pfs.unlink(req.files.upload.path).then(res.redirect('/'));
                        //});
                    });
            })
            .pipe(unzip.Extract({ path:'slides/' + newSlideshow._id }));
    });
}