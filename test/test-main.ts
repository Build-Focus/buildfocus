interface Window {
  __karma__: {
    files: string[];
    start(): void;
    loaded(): void;
  }
}

(function () {
  var karmaFiles = Object.keys(window.__karma__.files);

  var tests = karmaFiles.filter(function (filename) {
    var testRegex = /\/test\/spec\/.*\.js$/;
    return testRegex.test(filename);
  }).map(function (filename) {
    return filename.replace(/^\/base\/build\/|\.js$/g, '');
  });

  var testRequirePathMapping: { [id: string]: string } = {};
  karmaFiles.forEach(function (filename) {
    var scriptFileRegex = /\/base\/build\/(app\/scripts\/([^\/]+))/;
    var matcherResult = scriptFileRegex.exec(filename);

    if (matcherResult) {
      var testRequirePath = matcherResult[1].replace(/\.js$|\.js\.map$/, "");
      var correctRequirePath = matcherResult[2].replace(/\.js$|\.js\.map$/, "");
      testRequirePathMapping[testRequirePath] = correctRequirePath;
      return
    }
  });

  requirejs.config({
    baseUrl: "/base/build/app/scripts",

    paths: {
      test: "/base/build/test",
    },

    map: {
      test: testRequirePathMapping
    },

    urlArgs: "ts=" + Date.now(),

    deps: tests.concat(["test/helpers/mocha-setup"]),
    callback: window.__karma__.start
  });

// Make Karma async (for RequireJS: stolen from karma-requirejs/adapter.wrapper
  window.__karma__.loaded = function () {
  };
})();