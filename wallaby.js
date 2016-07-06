module.exports = (wallaby) => {
  wallaby.defaults.files.load = false;
  wallaby.defaults.files.instrument = false;
  wallaby.defaults.tests.load = false;
  wallaby.defaults.tests.instrument = false;

  function uninstrumentedLoad(pattern) {
    return { pattern: pattern, load: true, instrument: false };
  }

  return {
    files: [
      // These are the only bits Wallaby loads; it requirejs's everything else
      uninstrumentedLoad('app/bower_components/chai/chai.js'),
      uninstrumentedLoad('app/bower_components/chai-as-promised/lib/chai-as-promised.js'),
      uninstrumentedLoad('app/bower_components/resemblejs/resemble.js'),
      uninstrumentedLoad('app/bower_components/sinonjs/sinon.js'),
      uninstrumentedLoad('app/bower_components/sinon-chrome/src/chrome-alarms.js'),
      uninstrumentedLoad('app/bower_components/sinon-chrome/src/chrome-event.js'),
      uninstrumentedLoad('app/bower_components/sinon-chrome/src/chrome.js'),

      uninstrumentedLoad('app/bower_components/requirejs/require.js'),
      { pattern: 'app/scripts/config/base-config.ts', load: true },
      uninstrumentedLoad('test/wallaby-test-main.ts'),

      // Need to include and instrument all actual files (JS, HTML and images)
      'app/*',
      'app/scripts/**/*',
      'app/images/**/*',

      { pattern: 'test/helpers/*', instrument: false },
      { pattern: 'test/expected-images/*', instrument: false },

      // Load dependencies too (but only the ones that don't mess up Wallaby)
      { pattern: 'app/bower_components/**/*.js', instrument: false },
      { pattern: 'app/bower_components/**/*.css', instrument: false },
      { pattern: 'app/bower_components/**/*.png', instrument: false },
      { pattern: 'app/bower_components/**/*.js.map',instrument: false },
      { pattern: 'app/scripts/dependencies/**/*', instrument: false },

      '!app/bower_components/knockout/build/**/*',
      '!app/bower_components/**/*.coffee',
      '!app/bower_components/**/LICENSE',
      '!app/bower_components/bluebird/*',
      '!app/bower_components/heap/*',
      '!app/bower_components/hopscotch/demo/**/*',
    ],

    tests: [
      // Only actual test specs are included here
      { pattern: 'test/spec/**/*.ts', load: false },

      // Don't run acceptance tests automatically, since they're slow TODO - do this better?
      '!test/spec/acceptance/**/*'
    ],

    middleware: function (app, express) {
       app.use('/images',
               express.static(
                  require('path').join(__dirname, 'app', 'images')));
    },

    env: {
      kind: 'electron'
    },

    testFramework: 'mocha',

    debug: false
  };
};
