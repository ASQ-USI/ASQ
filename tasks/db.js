/**
  @fileoverview Grunt tasks for db
**/

'use strict';

module.exports = function(grunt) {

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
