'use strict';

module.exports = function (grunt) {

  // Load grunt tasks automatically
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  // Configurable paths
  var config = {
    app: 'app',
    test: 'test',
    build: 'build',
    dist: 'dist'
  };

  var bowerDependencies = Object.keys(grunt.file.readJSON('bower.json').dependencies).map(function (dep) {
    return "bower_components/" + dep + "/**/*.js";
  });

  var bowerDevDependencies = Object.keys(grunt.file.readJSON('bower.json').devDependencies).map(function (dep) {
    return "bower_components/" + dep + "/**/*.{js,css}";
  });

  function withNoCache(patterns) {
    return patterns.map(function (pattern) {
      if (typeof pattern === "string") {
        return { pattern: pattern, nocache: true };
      } else {
        pattern.nocache = true;
        return pattern;
      }
    });
  }

  grunt.initConfig({
    // Project settings
    config: config,

    // Watches files for changes and runs tasks based on the changed files
    watch: {
      js: {
        files: ['app/scripts/**/*.ts',
                'test/**/*.ts'],
        tasks: ['build', 'karma:continually:run'],
        options: {
          livereload: '<%= connect.options.livereload %>',
          atBegin: true,
          livereloadOnError: false
        }
      },
      content: {
        files: ['app/**/*.scss',
                'app/**/*.html'],
        tasks: ['build-content']
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
          'app/manifest.json',
          'app/_locales/{,*/}*.json'
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
            'build'
          ]
        }
      },
      test: {
        options: {
          port: 9002,
          open: false,
          base: [
            'test',
            'app',
            'build'
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
            'app',
            'build'
          ]
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: [ 'Gruntfile.js' ]
    },

    ts: {
      options: {
        module: 'amd',
        target: 'es5',
        inlineSources: true,
        fast: 'never',
        failOnTypeErrors: true
      },

      all: {
        src: ['app/scripts/**/*.ts', 'test/**/*.ts', 'typings/**/*.d.ts'],
        outDir: 'build'
      },

      // TODO: Renable somehow?
      fast: {
        src: ['app/scripts/**/*.ts', 'typings/**/*.d.ts'],
        outDir: 'build/scripts',
        options: {
          fast: 'watch'
        }
      }
    },

    sass: {
      options: {
        sourceMap: true // TODO: make these actually work
      },
      build: {
        files: {
          'build/app/styles/main.css': 'app/styles/main.scss'
        }
      }
    },

    karma: {
      options: {
        frameworks: ['mocha'],
        reporters: ['mocha'],
        browsers: ['Chrome'],
        proxies: {
          "/images/": "/base/build/app/images/",
          "/expected-images/": "/base/test/expected-images/",
          "/scripts/": "/base/build/app/scripts/"
        },
        files: withNoCache([
          'build/app/bower_components/chai/chai.js',
          'build/app/bower_components/resemblejs/resemble.js',

          'build/app/bower_components/sinonjs/sinon.js',

          'build/app/bower_components/sinon-chrome/src/chrome-alarms.js',
          'build/app/bower_components/sinon-chrome/src/chrome-event.js',
          'build/app/bower_components/sinon-chrome/src/chrome.js',

          'build/app/bower_components/requirejs/require.js',

          'build/app/scripts/config/base-config.js',
          'build/test/test-main.js',

          'build/app/scripts/pages/background-page-binding.js',
          { pattern: "build/test/**/*.js", included: false },
          { pattern: "build/test/**/*.js.map", included: false },

          { pattern: "build/app/scripts/**/*.js", included: false },
          { pattern: "build/app/scripts/**/*.js.map", included: false },

          { pattern: "build/app/bower_components/**/*.js", included: false },

          { pattern: "build/app/images/**/*", included: false, served: true },
          { pattern: "test/expected-images/**/*", included: false, served: true }
        ]),
        autoWatch: false
      },
      once: {
        singleRun: true
      },
      continually: {
        background: true,
        singleRun: false
      }
    },

    execute: {
      uploadToSeleniumFtp: {
        src: 'test/system/upload-extension-to-ftp.js'
      }
    },

    env: {
      dockerSeleniumEnv: {
        SELENIUM_URL: "http://" + (process.env.SELENIUM_CHROME_FTP_PORT_4444_TCP_ADDR || 'localhost') +
                      ':' + (process.env.SELENIUM_CHROME_FTP_PORT_4444_TCP_PORT || 4444) + '/wd/hub',
        EXTENSION_PATH: "/var/ftp/uploaded"
      },
      localSeleniumEnv: {
        SELENIUM_URL: "http://localhost:4444/wd/hub",
        EXTENSION_PATH: __dirname + "/dist"
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
            'build/*',
            '!build/.git*',
            'dist/*',
            '!dist/.git*'
          ]
        }]
      }
    },

    copy: {
      // Copy all non-compiled input files to build output - /build
      build: {
        files: [{
          expand: true,
          cwd: 'app',
          dest: 'build/app',
          src: [
            'manifest.json',
            '*.{ico,png,txt}',
            'images/**/*.{webp,gif,png,svg}',
            '*.html',
            'styles/libs/**/*.*',
            'styles/fonts/**/*.*',
            '_locales/**/*.json',
            'scripts/dependencies/**/*.js'
          ].concat(bowerDependencies).concat(bowerDevDependencies)
        }]
      },
      // Copy all prod-relevant build output to dist - /dist
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: 'build/app',
          dest: 'dist',
          src: [
            '**/*',

            // Drop all config except prod config
            '!scripts/config/**/*.js',
            'scripts/config/base-config.js',
            'scripts/config/prod-config.js',

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
            return 'package/buildfocus-' + manifest.version + '.zip';
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
        "buildfocus": {
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
      'connect:chrome',
      'karma:continually:start',
      'watch'
    ]);
  });

  grunt.registerTask('build', [
    'clean',
    'ts:all',
    'build-content'
  ]);

  grunt.registerTask('build-content', [
    'copy:build',
    'sass:build'
  ]);

  grunt.registerTask('test', [
    'build',
    'run-quick-tests'
  ]);

  grunt.registerTask('ci-test', [
    'test',
    // TODO: Renable these: disabled for now because FTP upload has mysteriously broken
    // 'prepare-system-tests',
    // 'run-system-tests'
  ]);

  grunt.registerTask('run-quick-tests', [
    'jshint',
    'karma:once'
  ]);

  grunt.registerTask('prepare-system-tests', [
    'dist',
    'execute:uploadToSeleniumFtp'
  ]);

  grunt.registerTask('run-system-tests', [
    'env:dockerSeleniumEnv',
    'mochaTest:system'
  ]);

  grunt.registerTask('run-local-system-tests', [
    'env:localSeleniumEnv',
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
