/**
  @fileoverview main Grunt task file
**/
'use strict';

var fs = require("fs")
  , path = require("path")
  , webpack = require("webpack");

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    //webpack
    webpack: {
      presenter: {
        entry: "./client/js/presenter.js",
        output: {
          path: "./public/js/",
          filename: "asq-presenter.js"
        },
        devtool: "sourcemap",
        debug: true,
        module:{
          loaders: [
              { test: /[\/]impress\.js$/, loader: "exports?impress" },
          ]
        },
        externals:[{
          jquery: 'jQuery'
        }]
      },
      viewer: {
        entry: "./client/js/viewer.js",
        output: {
          path: "./public/js/",
          filename: "asq-viewer.js"
        },
        devtool: "sourcemap",
        debug: true,
        module:{
          loaders: [
              { test: /[\/]impress\.js$/, loader: "exports?impress" },
          ]
        },
        externals:[{
          jquery: 'jQuery'
        }]
      },
      client: {
        entry: "./client/js/dom.js",
        output: {
          path: "./public/js/",
          filename: "asq-client.js"
        },
        devtool: "sourcemap",
        debug: true,
        // alias: 'client/js/client-socket.js:clientSocket,client/js/dom.js:dom,node_modules/dustjs-linkedin/dist/dust-core.js:dust',
        resolve:{
          alias: {
            clientSocket: __dirname + '/client/js/client-socket.js',
            dom: __dirname + '/client/js/dom.js',
            dust: __dirname +'/node_modules/dustjs-linkedin/dist/dust-core.js'
          }
        },
        externals:[{
          jquery: "jQuery"
        }]
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

    //concat
    concat: {
        options: {
          separator: ';',
        },
        vendor: {
          src: ['./node_modules/jquery/dist/jquery.js','client/js/vendor/bootstrap.js','client/js/vendor/jquery.hammer.js','client/js/vendor/isotope.pkgd.js'],
          dest: 'public/js/vendor.js',
        },
        vendorPresentation: {
          src: ['./node_modules/jquery/dist/jquery.js','client/js/vendor/bootstrap.js','client/js/vendor/jquery.flexbox.js','client/js/vendor/jquery.asq.expandSlide.js'],
          dest: 'public/js/asq-vendor-presentation.js',
        },
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
          'public/js/asq-vendor-presentation.min.js' : ['public/js/asq-vendor-presentation.js'],
          'public/js/asq-presenter.min.js' : ['public/js/asq-presenter.js'],
          'public/js/asq-viewer.min.js' : ['public/js/asq-viewer.js']
        }
      }
    },

    //less task
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

    //dust task
    dust: {
      client: {
        files: {
          "client/js/templates.js": "views/shared/**/*.dust"
        },
        options: {
          basePath: "dusts/" ,
          wrapper: "commonjs",
          wrapperOptions: {
            deps: {
              dust: "dust"
            }
          },
          useBaseName: true,
          runtime: false
        }
      }
    },

    //parallel tasks
    concurrent: {
      compile: [
        'dust',
        'less',
        'webpack:client',
        'webpack:presenter',
        'webpack:viewer'
      ],
      uglify: ['uglify'],
    },

    //watch
    watch: {
      options: {
        livereload: true
      },
      client: {
        files: ['client/js/*.js'],
        tasks: ['webpack'],
        options: {
          spawn: false
          // interrupt: true
        },
      },
      dust: {
        files: ['views/shared/**/*.dust'],
        tasks: ['dust'],
        options: {
          spawn: false,
          interrupt: true
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
  grunt.registerTask('build', ['dust', 'maybeless', 'concat', 'webpack', 'uglify']);
  grunt.registerTask('build-concurrent', ['concurrent:compile', 'concurrent:uglify']);
  grunt.registerTask('build-concurrent-dev', ['concurrent:compile']);
  grunt.registerTask('devwatch', ['concat', 'build-concurrent-dev', 'watch']);
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
