var TEST_REGEXP = /\/test\/spec\/.*\.js/;

var tests = Object.keys(window.__karma__.files).filter(function (filename) {
  return TEST_REGEXP.test(filename);
}).map(function (filename) {
  return filename.replace(/^\/base\/|\.js$/g, '');
});

requirejs.config({
  baseUrl: "/base/build/scripts",

  paths: {
    "test": "/base/test"
  },

  deps: tests.concat(["test/helpers/mocha-setup"]),
  callback: window.__karma__.start
});

// Make Karma async (for RequireJS: stolen from karma-requirejs/adapter.wrapper
window.__karma__.loaded = function () { };