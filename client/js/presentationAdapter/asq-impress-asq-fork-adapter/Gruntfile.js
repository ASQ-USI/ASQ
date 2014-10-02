/**
  @fileoverview main Grunt task file
**/
'use strict';

var webpack = require("webpack");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    webpack: {
      build: {
        entry: "./example.js",
        output: {
          path: "./example/js/",
          filename: "example.js"
        }
      },
      "build-dev": {
        entry: "./example.js",
        output: {
          path: "./example/js/",
          filename: "asqImpressAdapterExample.js"
        },
        watch: true,
        keepalive: true,
        devtool: "sourcemap",
        debug: true
      }
    },
  });

  // Default task(s).
  grunt.registerTask('default', ['webpack:build-dev']);

  //npm tasks
  require('load-grunt-tasks')(grunt);
};
