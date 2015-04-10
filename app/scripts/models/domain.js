'use strict';

window.Domain = (function () {
  function hasProtocol(urlString) {
    return urlString.match(/^\w+:\/\//);
  }

  // URI.js does foolish things if you have no protocol
  function addDefaultProtocol(pattern) {
    if (!hasProtocol(pattern)) {
      return "http://" + pattern;
    } else {
      return pattern;
    }
  }

  var PROTOCOL_DEFAULT_PORTS = {
    "http": "80",
    "https": "443",
    "ftp": "21"
  };

  function arePortsMatched(patternUrl, inputUrl) {
    var portFromProtocol = PROTOCOL_DEFAULT_PORTS[inputUrl.protocol()];
    var inputPort = inputUrl.port() ? inputUrl.port() : portFromProtocol;
    return (!patternUrl.port() || (inputPort === patternUrl.port()));
  }

  return function Domain(rawPattern) {
    this.pattern = rawPattern;

    var patternUrl = new URI(addDefaultProtocol(rawPattern));

    this.isValid = !!patternUrl.hostname();

    this.matches = function (urlInputString) {
      var inputUrl = new URI(addDefaultProtocol(urlInputString));

      var hostnameMatches = _.endsWith(inputUrl.hostname(), patternUrl.hostname());
      var pathMatches = _.startsWith(inputUrl.path(), patternUrl.path());
      var portMatches = arePortsMatched(patternUrl, inputUrl);

      return hostnameMatches && pathMatches && portMatches;
    };

    this.toString = function () {
      return patternUrl.host() + patternUrl.path();
    };
  };
}());