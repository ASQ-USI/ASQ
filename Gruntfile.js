/**
  @fileoverview main Grunt task file
**/


module.exports = function(grunt) {
  'use strict';

  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');

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

    jshint: {
      all: ['Gruntfile.js']//, 'public/js/**/*.js', 'test/**/*.js']
    },

    //concat
    concat: {
      options: {
        separator: ';'
      },
      dist: {
        src: ['public/js/**/*.js'],
        dest: 'build/asq.js'
      }
    },

    //uglify
    uglify: {
      options: {
        screw_ie8 : true,
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      build: {
        files: {
          'build/asq.min.js' : ['build/asq.js']
        }
      }
    }

  });

  // Default task(s).
  grunt.registerTask('default', ['mochaTest', 'jshint', 'concat', 'uglify']);


  grunt.registerTask('db', "Tasks for the Mongo Database", function(command) {
    console.log(process.env);
    switch (command) {
      case "drop" :
        grunt.task.run('dbDrop');
        break;
    }
  });

  grunt.registerTask('dbDrop', "Drops the schema of the asq database", function() {
    var mongoose = require('mongoose')
    , done = this.async();

    mongoose.connect('mongodb://localhost:27017/asq', function(err) {
      if (err) {
        throw err;
      }
      grunt.log.writeln('Dropping database: asq ...');
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
