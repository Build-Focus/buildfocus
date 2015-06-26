'use strict';

import URI = require('URIjs/URI');
import _ = require('lodash');

function hasProtocol(urlString) {
  return urlString.match(/^\w+:\/\//);
}

// URI.js does foolish things if you have no protocol
function addDefaultProtocol(pattern: string): string {
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

class Domain {
  public pattern: string;
  public isValid: boolean;

  private patternUrl: uri.URI;

  constructor(rawPattern) {
    this.pattern = rawPattern;
    this.patternUrl = <uri.URI> new URI(addDefaultProtocol(rawPattern));
    this.isValid = !!this.patternUrl.hostname();
  }

  public matches(urlInputString: string) {
    var inputUrl = <uri.URI> new URI(addDefaultProtocol(urlInputString));

    var hostnameMatches = _.endsWith(inputUrl.hostname(), this.patternUrl.hostname());
    var pathMatches = _.startsWith(inputUrl.path(), this.patternUrl.path());

    return hostnameMatches && pathMatches && this.portMatches(inputUrl);
  }

  public toString() {
    return this.patternUrl.host() + this.patternUrl.path();
  }

  private portMatches(inputUrl: uri.URI): boolean {
    var portFromProtocol = PROTOCOL_DEFAULT_PORTS[inputUrl.protocol()];
    var inputPort = inputUrl.port() ? inputUrl.port() : portFromProtocol;
    return (!this.patternUrl.port() || (inputPort === this.patternUrl.port()));
  }
}

export = Domain;