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

    //mocha tests
    mochaTest: {
      test: {
        options: {
          reporter: 'spec'
        },
        src: ['test/**/*.js']
      }
    },

    //browserify
    browserify: {
      vendor:{
        src: ['client/js/vendor/vendor-entry.js'],//, 'jquery-1.10.2.js', 'bootstrap.js'],
        dest: 'public/js/vendor.js',
        options:{
          debug: true,
          alias: 'client/js/vendor/jquery-1.10.2.js:jQuery',
          shim:{
            bootstrap:{
              path: 'client/js/vendor/bootstrap.js',
              exports: null,
              depends: {jQuery:'jQuery'}
            },
            jQueryScrollTo:{
              path: 'client/js/vendor/jquery.scrollTo.js',
              exports: null,
              depends: {jQuery:'jQuery'}
            },
            isotope:{
              path: 'client/js/vendor/jquery.isotope.js',
              exports: null,
              depends: {jQuery:'jQuery'}
            },
            jqueryHammer:{
              path: 'client/js/vendor/jquery.hammer.js',
              exports: 'Hammer',
              depends: {jQuery:'jQuery'}
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
          external: ["jQuery"]
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
          external: ["jQuery"]
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
          external: ["jQuery"]
        }
      },
      dist:{
        src: ['client/asq-previewer/asq.js'],
        dest: 'dist/asq-previewer/js/asq.js',
        options: {
          debug: true,
          alias: 'client/asq-previewer/asq.js:asq,client/js/vendor/jquery-1.10.2.js:jQuery,client/asq-previewer/asq-templates.js:ASQTemplates,client/asq-previewer/dust-runtime.js:dust' 
          ,
          external: ["cheerio","./dustfs", "../logger"],
        }        
      }
    },

    clean: {
      slides: ["slides/*"],
      testslides: ["test/slides/*"]
    },

    command : {
        deploy: {
            cmd  : 'git push production devel'
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
      },
      dist: {
        files: {
          'dist/asq-previewer/js/asq.min.js' : ['dist/asq-previewer/js/asq.js'],
        }
      }
    },

    less: {
      development: {
        options: {
          paths: ["client/less"]
        },
        files: {
          "public/css/signin.css": "client/less/signin.less",
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
          "public/css/signin.css": "client/less/signin.less",
          "public/css/logoAnim.css": "client/less/logoAnim.less",
          "public/css/phone.css": "client/less/phone.less",
          "public/css/style.css": "client/less/style.less"
        }
      }
    },

    dust: {
      asq_render: {
        files: {
          "lib/assessment/asqTemplates.js": "views/asq-render/**/*.dust"
        },
        options: {
          basePath: "views/asq-render/" ,
          wrapper: "commonjs",
          wrapperOptions: {
            deps: {
              dust: "dustjs-linkedin"
            }
          },
          runtime: false
        }
      },
      dist: {
        files: {
          "client/asq-previewer/asq-templates.js": "views/asq-render/**/*.dust"
        },
        options: {
          basePath: "views/asq-render/" ,
          wrapper: "commonjs",
          wrapperOptions: {
            returning: "dust",
            deps: {
              dust: "dust"
            }
          },
          runtime: false
        }
      }
    },

    //watch
    watch: {
      options:{
        livereload: true
      },
      client: {
        files: ['client/js/*.js'],
        tasks: ['browserify:client', 'browserify:presenter', 'browserify:viewer'],
        options: {
          spawn: false
          // interrupt: true
        },
      },
      dust:{
        files: ['views/asq-render/**/*.dust'],
        tasks: ['dust'],
        options: {
          interrupt: true
        },
      },
      dist: {
        files: ['lib/assessment/**/*.js', 'client/asq-previewer/**/*.js'],
        tasks: ['browserify:dist'],
        options: {
          interrupt: true
        },
      },
      less: {
        files: ['client/less/*.less'],
        tasks: ['less:development'],
        options: {
          interrupt: true
        },
      },
      minimal: {
        files: ['client/js/*.js', 'views/asq-render/**/*.dust', 'client/less/**/*.less'],
        tasks: ['browserify:client', 'browserify:presenter', 'browserify:viewer', 'dust', 'less:development'],
        options: {
          interrupt: true
        },
      }
    }
  });

  // Our custom tasks.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['maybeless', 'dust', 'browserify', 'uglify']);
  grunt.registerTask('devwatch', ['build', 'watch:minimal']);
  grunt.registerTask('deploy', ['command:deploy']);

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
  grunt.loadNpmTasks('grunt-mocha-test');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-commands');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-dust');


  //load external taks
  grunt.loadTasks('./tasks');

};
