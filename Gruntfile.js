/**
  @fileoverview main Grunt task file
**/
'use strict';

var fs = require("fs")
  , path = require("path");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //browserify
    browserify: {
      vendor:{
        src: ['client/js/vendor/vendor-entry.js'],//, 'jquery-1.10.2.js', 'bootstrap.js'],
        dest: 'public/js/vendor.js',
        options:{
          debug: true,
          // alias: 'client/js/vendor/jquery-1.10.2.js:jquery',
          alias: 'jQuery:$',
          shim:{
            bootstrap:{
              path: 'client/js/vendor/bootstrap.js',
              exports: null,  
              depends: {jQuery:'jQuery', $:'$'}
            },
            jqueryScrollTo:{
              path: 'client/js/vendor/jquery.scrollTo.js',
              exports: null,
              depends: {jquery:'jQuery', $:'$'}
            },
            isotope:{
              path: 'client/js/vendor/jquery.isotope.js',
              exports: null,
              depends: {jquery:'jQuery', $:'$'}
            },
            jqueryHammer:{
              path: 'client/js/vendor/jquery.hammer.js',
              exports: 'Hammer',
              depends: {jquery:'jQuery', $:'$'}
            }    
          }
       }
      },
      client:{
        src: ['client/js/dom.js'],
        dest: 'public/js/asq-client.js',
        options:{
          debug: true,
          alias: 'client/js/client-socket.js:clientSocket,client/js/dom.js:dom',
          //external: ['jQuery']
       }
      },
      presenter: {
        src: ['client/js/presenter.js'],
        dest: 'public/js/asq-presenter.js',
        options: {
          debug: true,
          shim: {
            impressPresenter: {path: 'client/js/impress-presenter.js', exports: 'impress'}
          },
          //external: ['jQuery']
        }
      },
      viewer: {
        src: ['client/js/viewer.js'],
        dest: 'public/js/asq-viewer.js',
        options: {
          debug: true,
          shim: {
            impressViewer: {path: 'client/js/impress-viewer.js', exports: 'impress'}
          },
          //external: ['jQuery']
        }
      }
    },

    clean: {
      slides: ["slides/*"],
      testslides: ["test/slides/*"]
    },

    shell : {
        deploy: {
            command  : 'git push production devel',
            options: {
              stdout: true,
              stderr: true
            }
        }
    },

    //jshint
    jshint: {
      all: ['Gruntfile.js'
          , 'client/js/**/*.js'
          , '!client/js/vendor/**/*.js'
          , 'test/**/*.js']
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
    },

    less: {
      development: {
        options: {
          paths: ["client/less"]
        },
        files: {
          "public/css/login.css": "client/less/login.less",
          "public/css/logoAnim.css": "client/less/logoAnim.less",
          "public/css/phone.css": "client/less/phone.less",
          "public/css/style.css": "client/less/style.less"
        }
      },
      production: {
        options: {
          paths: ["client/less"],
          yuicompress: true
        },
        files: {
          "public/css/login.css": "client/less/login.less",
          "public/css/logoAnim.css": "client/less/logoAnim.less",
          "public/css/phone.css": "client/less/phone.less",
          "public/css/style.css": "client/less/style.less"
        }
      }
    },

    //parallel tasks
    concurrent: {
      compile: ['less', 'browserify:vendor', 'browserify:client', 'browserify:presenter', 'browserify:viewer'],
      uglify: ['uglify'],
    },

    //watch
    watch: {
      options:{
        livereload: true
      },
      client: {
        files: ['client/js/*.js'],
        tasks: ['concurrent:compile'],
        options: {
          spawn: false
          // interrupt: true
        },
      },
      less: {
        files: ['client/less/*.less'],
        tasks: ['less:development'],
        options: {
          interrupt: true
        },
      }
    }
  });

  // Our custom tasks.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['maybeless', 'browserify', 'uglify']);
  grunt.registerTask('build-concurrent', ['concurrent:compile', 'concurrent:uglify']);
  grunt.registerTask('devwatch', ['build-concurrent', 'watch']);
  grunt.registerTask('deploy', ['shell:deploy']);

  //ported from togetherjs
  //https://github.com/mozilla/togetherjs/blob/develop/Gruntfile.js
  grunt.registerTask('maybeless', 'Maybe compile togetherjs.less', function () {
  var sources = grunt.file.expand(['client/less/*.less']);
  var found = false;
  sources.forEach(function (fn) {
    var source = fs.statSync(fn);
    var basename = path.basename(fn)
    var destFn = 'public/css/' + basename.substr(0, basename.length-4) + 'css';
    if (! fs.existsSync(destFn)) {
      found = true;
      return;
    }
    var dest = fs.statSync(destFn);
    if (source.mtime.getTime() > dest.mtime.getTime()) {
      grunt.log.writeln('Destination LESS out of date: ' + destFn.cyan);
      found = true;
    }
  });
  if (found) {
    grunt.task.run('less');
  } else {
    grunt.log.writeln('No .less files need regenerating.');
  }
});

  //npm tasks
  require('load-grunt-tasks')(grunt);

  //load custom tasks
  grunt.loadTasks('./tasks');

};
