var mongoose        = require('mongoose')
, slideshowSchema   = require('./models/slideshow')         

namespace('db', function () {
  desc('This the db:emptySlideshows task');
  task('emptySlideshows', [], function () {
    console.log('doing db:emptySlideshows task');
   // console.log(sys.inspect(arguments));

    var db = mongoose.createConnection('127.0.0.1', 'asq')
    , Slideshow = db.model('Slideshow');

     Slideshow.remove({}, function(err){
      console.log("I am in")
        complete();
      if(err){
        console.log(err)
      }
       complete();
    });

     
  }, true);

  desc('This the db:emptyQuestions task');
  task('emptyQuestion', [], function () {
    console.log('doing foo:baz task');
  //  console.log(sys.inspect(arguments));
  });

});