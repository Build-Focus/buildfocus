var TEST_REGEXP = /\/test\/spec\/.*\.js$/;

interface Window {
  __karma__: {
    files: string[];
    start(): void;
    loaded(): void;
  }
}

var tests = Object.keys(window.__karma__.files).filter(function (filename) {
  return TEST_REGEXP.test(filename);
}).map(function (filename) {
  return filename.replace(/^\/base\/build\/|\.js$/g, '');
});

requirejs.config({
  baseUrl: "/base/build/app/scripts",

  paths: {
    "test": "/base/build/test",
  },

  map: {
    'test': {
      'app/scripts/city': 'city'
    }
  },

  urlArgs: "ts=" + Date.now(),

  deps: tests.concat(["test/helpers/mocha-setup"]),
  callback: window.__karma__.start
});

// Make Karma async (for RequireJS: stolen from karma-requirejs/adapter.wrapper
window.__karma__.loaded = function () { };