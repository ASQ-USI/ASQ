/**
  @fileoverview main Grunt task file
**/


module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //mocha tests
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    browserify: {
      vendor:{
        cwd: 'client/lib/',
        src: ['*.js'],
        dest: 'public/js/vendor.js',
        options:{
          noParse: ['*.js', '!jquery.min.js'],
          shim:{
            jQuery: {path: 'client/lib/jquery.min.js', exports: '$'}
          }
        }
      },
      presenter: {
        src: ['client/admin.js'],
        dest: 'public/js/asq-presenter.js',
        debug: true,
        options: {
          shim: {
            impressAdmin: {path: 'client/impress-presenter.js', exports: 'impress'}
          }
        }
      },
      viewer: {
        src: ['client/viewer.js'],
        dest: 'public/js/asq-viewer.js',
        options: {
          shim: {
            impressAdmin: {path: 'client/impress-viewer.js', exports: 'impress'}
          }
        }
      },
    },

    jshint: {
      all: ['Gruntfile.js', 'client/*.js', 'test/**/*.js']
    },

    //uglify
    uglify: {
      options: {
        screw_ie8 : true,
        mangle:false,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'public/js/vendor.min.js' : ['public/js/vendor.js'],
          'public/js/asq-presenter.min.js' : ['public/js/asq-presenter.js'],
          'public/js/asq-viewer.min.js' : ['public/js/asq-viewer.js']
        }
      }
    }

  });

  // Default task(s).
  grunt.registerTask('default', ['mochaTest', 'jshint', 'browserify', 'uglify']);

  /* ------------------- Database Tasks -------------------------*/

  //the basic db task. It calls all the other tasks
  grunt.registerTask('db', "Tasks for the Mongo Database", function(command) {
    switch (command) {
      case "drop" :
        grunt.task.run('dbDrop');
        break;
    }
  });

  //This task is responsible for droping the databases
  grunt.registerTask('dbDrop', "Drops the schema of the asq database", function() {
    var done = this.async()
    , mongoose = require('mongoose')
    , env = grunt.option('env') || 'dev'
    , dbName;

    switch (env) {
      case "dev" :
        dbName = "asq-dev";
        break;
      case "test" :
        dbName = "asq-test";
        break;
      default:
        dbName = "asq-dev";
    }

    mongoose.connect('mongodb://localhost:27017/'+dbName, function(err) {
      if (err) {
        throw err;
      }
      grunt.log.writeln('Dropping database: '+ dbName +' ...');
      mongoose.connection.db.dropDatabase(function(err) {
        if (err) {
          done(err);
        } else {
          grunt.log.ok();
          done();
        }
      });
    });
  });

};
