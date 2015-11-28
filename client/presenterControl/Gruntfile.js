/**
  @fileoverview main Grunt task file
**/
'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    webpack:{
      app: {
        entry: "./public/components/presenter-control-app/_presenter-control-app.js",
        output: {
          path: "./public/components/presenter-control-app/",
          filename: "presenter-control-app.js"
        },
        resolve: {
          modulesDirectories: ["node_modules","public/bower_components/"],
        },
        devtool: "sourcemap",
        debug: true
      },
      thumbnail_manager: {
        entry: "./public/components/thumbnail-manager/_thumbnail-manager.js",
        output: {
          path: "./public/components/thumbnail-manager/",
          filename: "thumbnail-manager.js"
        },
        resolve: {
          modulesDirectories: ["node_modules","public/bower_components/"],
        },
        devtool: "sourcemap",
        debug: true
      },
      connection: {
        entry: "./public/components/asqw-connection/_asqw-connection.js",
        output: {
          path: "./public/components/asqw-connection/",
          filename: "asqw-connection.js"
        },
        resolve: {
          modulesDirectories: ["node_modules","public/bower_components/"],
        },
        devtool: "sourcemap",
        debug: true
      },
      adapter_socket_interface: {
        entry: "./public/components/adapter-socket-interface/_adapter-socket-interface.js",
        output: {
          path: "./public/components/adapter-socket-interface/",
          filename: "adapter-socket-interface.js"
        },
        resolve: {
          modulesDirectories: ["node_modules","public/bower_components/"],
        },
        devtool: "sourcemap",
        debug: true
      },
      impress_asq_fork_asq_adapter: {
        entry: "./public/components/impress-asq-fork-asq-adapter/_impress-asq-fork-asq-adapter.js",
        output: {
          path: "./public/components/impress-asq-fork-asq-adapter/",
          filename: "impress-asq-fork-asq-adapter.js"
        },
        resolve: {
          modulesDirectories: ["node_modules","public/bower_components/"],
        },
        devtool: "sourcemap",
        debug: true
      },
    },

    // //less task
    // less: {
    //   development: {
    //     options: {
    //       paths: ["public/components"]
    //     },
    //     files: [{
    //       expand: true,
    //       cwd:  "public/components",
    //       src:  ["**/*.less"],
    //       dest: "public/components/",
    //       ext:  ".css"
    //     }]
    //   },
    //   production: {
    //     options: {
    //       paths: ["public/components"],
    //       yuicompress: true
    //     },
    //     files: [{
    //       expand: true,
    //       cwd:  "public/components",
    //       src:  ["**/*.less"],
    //       dest: "public/components/",
    //       ext:  ".css"
    //     }]
    //   }
    // },


    //watch
    watch: {
      options: {
        livereload: true
      },
      webpack_app:{
        files: ['public/components/presenter-control-app/**/*.js',  '!public/components/presenter-control-app/presenter-control-app.js'],
        tasks: ['webpack:app'],
        options: {
          interrupt: true
        },
      },
      webpack_thumbnail_manager:{
        files: ['public/components/thumbnail-manager/**/*.js',  '!public/components/thumbnail-manager/thumbnail-manager.js'],
        tasks: ['webpack:thumbnail_manager'],
        options: {
          interrupt: true
        },
      },
      webpack_connection:{
        files: ['public/components/asqw-connection/**/*.js',  '!public/components/asqw-connection/asqw-connection.js'],
        tasks: ['webpack:connection'],
        options: {
          interrupt: true
        },
      },
      webpack_adapter_socket_interface:{
        files: ['public/components/adapter-socket-interface/**/*.js',  '!public/components/adapter-socket-interface/adapter-socket-interface.js'],
        tasks: ['webpack:adapter_socket_interface'],
        options: {
          interrupt: true
        },
      },
      webpack_impress_asq_fork_asq_adapter:{
        files: ['public/components/impress-asq-fork-asq-adapter/**/*.js',  '!public/components/impress-asq-fork-asq-adapter/impress-asq-fork-asq-adapter.js'],
        tasks: ['webpack:impress_asq_fork_asq_adapter'],
        options: {
          interrupt: true
        },
      },
      // less: {
      //   files: ['public/components/**/*.less'],
      //   tasks: ['less:development', 'concat'],
      //   options: {
      //     interrupt: true
      //   },
      // }
    }
  });

  // Our custom tasks.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['webpack']);
  grunt.registerTask('devwatch', ['build', 'watch']);

  //npm tasks
  require('load-grunt-tasks')(grunt);
};
