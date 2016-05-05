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
    }
  });

  var acceptanceTests = tests.filter((t) => t.indexOf("/acceptance/") !== -1);
  var unitTests = tests.filter((t) => t.indexOf("/acceptance") === -1);
  
  requirejs.config({
    baseUrl: "/base/build/app/scripts",

    paths: {
      test: "/base/build/test",
    },

    map: {
      test: testRequirePathMapping
    },

    urlArgs: "ts=" + Date.now(),

    deps: ["test/helpers/mocha-setup"],
    callback: function() {
      // This is a terrible hack to force test ordering. TODO: Properly separate these
      require(acceptanceTests, () => require(unitTests, () => window.__karma__.start()));
    }
  });

  // Make Karma async (for RequireJS: stolen from karma-requirejs/adapter.wrapper
  window.__karma__.loaded = function () { };
})();
