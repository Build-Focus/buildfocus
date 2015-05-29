// Generated on 2015-04-09 using generator-chrome-extension 0.3.1
'use strict';

// # Globbing
// for performance reasons we're only matching one level down:
// 'test/spec/{,*/}*.js'
// use this if you want to recursively match all subfolders:
// 'test/spec/**/*.js'

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    dist: 'dist'
  };

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      bower: {
        files: ['bower.json'],
        tasks: ['bowerInstall']
      },
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.js', 'test/**/*.js', '**/*.html'],
        tasks: ['run-tests'],
        options: {
          livereload: '<%= connect.options.livereload %>',
          atBegin: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['jshint']
      },
      styles: {
        files: ['<%= config.app %>/styles/{,*/}*.css'],
        tasks: [],
        options: {
          livereload: '<%= connect.options.livereload %>'
        }
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
          '<%= config.app %>/*.html',
          '<%= config.app %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}',
          '<%= config.app %>/manifest.json',
          '<%= config.app %>/_locales/{,*/}*.json'
        ]
      }
    },

    // Grunt server and debug server setting
    connect: {
      options: {
        livereload: 35729,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      chrome: {
        options: {
          port: 9001,
          open: false,
          base: [
            '<%= config.app %>'
          ]
        }
      },
      test: {
        options: {
          port: 9002,
          open: false,
          base: [
            'test',
            '<%= config.app %>'
          ]
        }
      },
      manualtest: {
        options: {
          port: 8080,
          open: true,
          keepalive: true,
          base: [
            'test',
            '<%= config.app %>'
          ]
        }
      }
    },

    // Make sure code styles are up to par and there are no obvious mistakes
    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [
        'Gruntfile.js',
        '<%= config.app %>/scripts/{,*/}*.js',
        '!<%= config.app %>/scripts/vendor/*',
        'test/spec/{,*/}*.js'
      ]
    },

    mocha: {
      options: {
        run: true,
        log: true,
        logErrors: true,
        growlOnSuccess: false
      },
      unit: {
        options: {
          urls: ['http://localhost:<%= connect.test.options.port %>/unit-tests.html']
        }
      },
      system: {
        options: {
          urls: ['http://localhost:<%= connect.test.options.port %>/pomodoro-acceptance.html',
            'http://localhost:<%= connect.test.options.port %>/failure-page-acceptance.html']
        }
      }
    },

    // Empties folders to start fresh
    clean: {
      chrome: {
      },
      dist: {
        files: [{
          dot: true,
          src: [
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    // Copies remaining files to places other tasks can use
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.dist %>',
          src: [
            'manifest.json',
            '*.{ico,png,txt}',
            'images/**/*.{webp,gif,png}',
            '*.html',
            'styles/**/*.css',
            'styles/fonts/**/*.*',
            '_locales/**/*.json',
            'scripts/**/*.js',
            'bower_components/**/*.js'
          ]
        }]
      }
    },

    // Compress dist files to package
    compress: {
      dist: {
        options: {
          archive: function() {
            var manifest = grunt.file.readJSON('app/manifest.json');
            return 'package/rivet-' + manifest.version + '.zip';
          }
        },
        files: [{
          expand: true,
          cwd: 'dist/',
          src: ['**'],
          dest: ''
        }]
      }
    }
  });

  grunt.registerTask('debug', function () {
    grunt.task.run([
      'connect:test',
      'connect:chrome',
      'watch'
    ]);
  });

  grunt.registerTask('test', [
    'connect:test',
    'run-tests'
  ]);

  grunt.registerTask('run-tests', [
    'jshint',
    'mocha:unit',
    'mocha:system'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'copy',
    'compress'
  ]);

  grunt.registerTask('default', [
    'test',
    'build'
  ]);
};
