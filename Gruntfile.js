var mongoose        = require('mongoose')
  

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        src: 'src/<%= pkg.name %>.js',
        dest: 'build/<%= pkg.name %>.min.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Default task(s).
  grunt.registerTask('default', ['uglify']);
  grunt.registerTask('db', "Tasks for the Mongo Database", function(command){
    switch(command){
      case : "drop"
        grunt.run('dbDrop')
    }
  })

  grunt.registerTask('dbDrop', "Drops the schema of the asq database", function(){
    var mongoose = require('mongoose');
    mongoose.connect('mongo://localhost/mydatabase', function(err) {
      mongoose.connection.db.dropDatabase();
    });
  })

};


// var mongoose        = require('mongoose')
// , slideshowSchema   = require('./models/slideshow')         

// namespace('db', function () {
//   desc('This the db:emptySlideshows task');
//   task('emptySlideshows', [], function () {
//     console.log('doing db:emptySlideshows task');
//    // console.log(sys.inspect(arguments));

//     var db = mongoose.createConnection('127.0.0.1', 'asq')
//     , Slideshow = db.model('Slideshow');

//      Slideshow.remove({}, function(err){
//       console.log("I am in")
//         complete();
//       if(err){
//         console.log(err)
//       }
//        complete();
//     });

     
//   }, true);

//   desc('This the db:emptyQuestions task');
//   task('emptyQuestion', [], function () {
//     console.log('doing foo:baz task');
//   //  console.log(sys.inspect(arguments));
//   });

// });