'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    build: 'build',
    dist: 'dist'
  };

  var bowerDependencies = Object.keys(grunt.file.readJSON('bower.json').dependencies).map(function (dep) {
    return "bower_components/" + dep + "/**/*.js";
  });

  var bowerDevDependencies = Object.keys(grunt.file.readJSON('bower.json').devDependencies).map(function (dep) {
    return "bower_components/" + dep + "/**/*.{js,css}";
  });

  grunt.initConfig({

    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['<%= config.app %>/scripts/{,*/}*.ts', 'test/**/*.js', '**/*.html'],
        tasks: ['build-fast', 'run-quick-tests'],
        options: {
          livereload: '<%= connect.options.livereload %>',
          atBegin: true
        }
      },
      gruntfile: {
        files: ['Gruntfile.js'],
        tasks: ['jshint']
      },
      livereload: {
        options: {
          livereload: '<%= connect.options.livereload %>'
        },
        files: [
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
            '<%= config.build %>'
          ]
        }
      },
      test: {
        options: {
          port: 9002,
          open: false,
          base: [
            'test',
            '<%= config.app %>',
            '<%= config.build %>'
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
            '<%= config.app %>',
            '<%= config.build %>'
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

    ts: {
      options: {
        module: 'amd',
        target: 'es5',
        mapRoot: '/scripts',
        sourceRoot: '/scripts',
        fast: 'never'
      },

      app: {
        src: ['app/scripts/**/*.ts', 'typings/**/*.d.ts'],
        outDir: '<%= config.build %>/scripts'
      },

      fast: {
        src: ['app/scripts/**/*.ts', 'typings/**/*.d.ts'],
        outDir: '<%= config.build %>/scripts',
        options: {
          fast: 'watch'
        }
      }
    },

    // Browser-based tests
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
      acceptance: {
        options: {
          urls: ['http://localhost:<%= connect.test.options.port %>/pomodoro-acceptance.html',
                 'http://localhost:<%= connect.test.options.port %>/rivet-page-acceptance.html',
                 'http://localhost:<%= connect.test.options.port %>/city-acceptance.html']
        }
      }
    },

    execute: {
      uploadToSeleniumFtp: {
        src: 'test/system/upload-extension-to-ftp.js'
      }
    },

    env: {
      seleniumEnv: {
        SELENIUM_URL: "http://" + (process.env.SELENIUM_CHROME_FTP_PORT_4444_TCP_ADDR || 'localhost') +
                      ':' + (process.env.SELENIUM_CHROME_FTP_PORT_4444_TCP_PORT || 4444) + '/wd/hub'
      }
    },

    // Node tests (for Selenium)
    mochaTest: {
      system: {
        options: {
          reporter: 'spec',
          timeout: 1000 * 60 * 30
        },
        src: 'test/system/system-tests.js'
      }
    },

    // Empties folders to start fresh
    clean: {
      all: {
        files: [{
          dot: true,
          src: [
            '<%= config.build %>/*',
            '!<%= config.build %>/.git*',
            '<%= config.dist %>/*',
            '!<%= config.dist %>/.git*'
          ]
        }]
      }
    },

    copy: {
      // Copy all non-compiled input files to build output - /build
      build: {
        files: [{
          expand: true,
          cwd: '<%= config.app %>',
          dest: '<%= config.build %>',
          src: [
            'manifest.json',
            '*.{ico,png,txt}',
            'images/**/*.{webp,gif,png}',
            '*.html',
            'styles/**/*.css',
            'styles/fonts/**/*.*',
            '_locales/**/*.json',

            // We bring the typescript too, for sourcemapping purposes
            '**/*.ts'
          ].concat(bowerDependencies).concat(bowerDevDependencies)
        }]
      },
      // Copy all prod-relevant build output to dist - /dist
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: '<%= config.build %>',
          dest: '<%= config.dist %>',
          src: [
            '**/*',

            // Drop all config except prod config
            '!scripts/config/**/*.js',
            'scripts/config/base-config.js',
            'scripts/config/prod-rivet-config.js',

            // Don't copy all bower components, only bowerDependencies (no dev deps)
            '!bower_components/**/*'
          ].concat(bowerDependencies)
        }]
      }
    },

    'json-replace': {
      removeDevScripts: {
        options: {
          "replace": {
            "background": {
              "scripts": [
                "bower_components/requirejs/require.js",
                "scripts/config/base-config.js",
                "scripts/pages/background-page-binding.js"
              ]
            },
            // Prod key
            "key": "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzGs5OrC25oia2USb" +
                   "73XOKQi3KmgeO+gCiw4V0d924qvwMgDKiZyiwk2fVjFolwq72I/6rVptoXJq" +
                   "/iS1iB2bWB+tr1Sm+NSrjD+ydmdkcwxS4MGXH5/wmmli7Jz0g11+iPX3BLvA" +
                   "CdwpOKi4Mw1XZ1uJRUj6n2xecn0mvWrJX4nOrWn5F50QjQyXhHXbG7JJbgx9" +
                   "2hUeSSI0BVv/KAIDBnEXjmJNba8Um01b5OkCr151s4Tgwp6NPNDtuut+4z61" +
                   "MsmAoUdEAmJqL339C/3TFzwxiqhuJk1PC5g8Q0YQ+eMmBvG2Yals63VF8Fgx" +
                   "TXksr8DLZvU5IdUh7unRXuqdIwIDAQAB"
          }
        },
        src: config.dist + "/manifest.json",
        dest: config.dist + "/manifest.json"
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
    },

    bump: {
      options: {
        files: ['app/manifest.json'],
        commit: true,
        commitMessage: 'Release %VERSION%',
        commitFiles: ['app/manifest.json'],
        createTag: true,
        tagName: 'v%VERSION%',
        tagMessage: 'Version %VERSION%',
        push: true,
        pushTo: (process.env.GIT_REMOTE || 'origin') + ' HEAD:master'
      }
    },

    "webstore_upload": {
      "accounts": {
        "default": {
          "publish": true,
          "client_id": process.env.WEBSTORE_CLIENT_ID,
          "client_secret": process.env.WEBSTORE_CLIENT_SECRET,
          "refresh_token": process.env.WEBSTORE_REFRESH_TOKEN
        }
      },
      "extensions": {
        "rivet": {
          "appID": "apckocnmlmkhhigodidbpiakommhmiik",
          "zip": "package/", // Uploads the most recent zip in this folder
          "publish": true,
          "publishTarget": "trustedTesters"
        }
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

  grunt.registerTask('build', [
    'clean',
    'ts:app',
    'copy:build'
  ]);

  grunt.registerTask('build-fast', [
    'ts:fast',
    'copy:build'
  ]);

  grunt.registerTask('test', [
    'build',
    'connect:test',
    'run-quick-tests'
  ]);

  grunt.registerTask('ci-test', [
    'test',
    'prepare-system-tests',
    'run-system-tests'
  ]);

  grunt.registerTask('run-quick-tests', [
    'jshint',
    'mocha:unit',
    'mocha:acceptance'
  ]);

  grunt.registerTask('prepare-system-tests', [
    'dist',
    'execute:uploadToSeleniumFtp'
  ]);

  grunt.registerTask('run-system-tests', [
    'env:seleniumEnv',
    'mochaTest:system'
  ]);

  grunt.registerTask('dist', [
    'bump-only',
    'build',
    'copy:dist',
    'json-replace',
    'compress'
  ]);

  // Assumes you've already done a build, and verified it appropriately.
  grunt.registerTask('release', [
    'webstore_upload',
    'bump-commit'
  ]);

  grunt.registerTask('default', [
    'test',
    'dist'
  ]);
};
