'use strict';

window.Domain = (function () {
  function fixUpUrl(pattern) {
    if (!pattern.match(/\w+:\/\//)) {
      return "http://" + pattern;
    } else {
      return pattern;
    }
  }

  return function Domain(pattern) {
    this.pattern = pattern;

    pattern = fixUpUrl(pattern);
    var patternUrl = new URI(pattern);

    this.isValid = !!patternUrl.host();

    this.matches = function (urlInputString) {
      var urlToMatch = new URI(fixUpUrl(urlInputString));

      return _.endsWith(urlToMatch.host(), patternUrl.host()) &&
             _.startsWith(urlToMatch.path(), patternUrl.path());
    };

    this.toString = function () {
      return patternUrl.host() + patternUrl.path();
    }
  };
}());