/**
  @fileoverview Grunt tasks for db
**/

'use strict';

var mongoose = require('mongoose');

module.exports = function(grunt) {

  //the basic db task. It calls all the other tasks
  grunt.registerTask('db', "Tasks for the Mongo Database", function(command, collection) {
    // see if collection is specified
    var subtask = typeof collection == 'undefined' ? '' : (':' + collection)

    //set environment
    global['env'] = grunt.option('env') || 'development';

    // figure which database to act upon
    switch (env) {
      case "dev" :
      case "development" :
        global['dbName'] = "asq-dev";
        break;
      case "test" :
        global['dbName'] = "asq-test";
        break;
      case "prod" :
      case "prod" :
        global['dbName'] = "asq";
        break;
      default:
        global['dbName'] = "asq-dev";
    }

    //run the actual task
    switch (command) {
      case "drop" :
        grunt.task.run('dbDrop');
        break;
      case "empty" :
        if(subtask ==''){
          grunt.log.error('"empty" target needs a valid collection (model) argument');
        }
        grunt.task.run('dbEmpty'+ subtask);
        break;
    }
  });

  //This task is responsible for droping the databases
  grunt.registerTask('dbDrop', "Drops the schema of the asq database", function() {
    var done = this.async()
    , dbName =  global['dbName'];
    

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

    //This task is responsible for droping the databases
  grunt.registerTask('dbEmpty', "Empty all or a specific collection from the db", function(collection) {
    var done = this.async()
      , dbName =  global['dbName']
      global.db = mongoose.createConnection('mongodb://localhost:27017/'+dbName)
      var schemas = require('../models');

    grunt.log.writeln('Emptying model: '+ dbName +'.' + collection + ' ...');

    var TheModel = db.model(collection);
    TheModel.remove({},function (err) {
      if(err) done(err);
      grunt.log.ok();
      done();
    });

  });

};
