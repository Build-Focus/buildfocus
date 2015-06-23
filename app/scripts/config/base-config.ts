'use strict';

var extensionId = chrome.runtime.id;

var configPrefixes = {
  "apckocnmlmkhhigodidbpiakommhmiik": "prod",
  "ednpnngpmfdcjpkjnigpokincopbdgbp": "dev",
  "abcabcbabcabcabcbabcabcabcbabcab": "test"
};

var configPrefix = configPrefixes[extensionId];

requirejs.config({
  "baseUrl": "/scripts",
  "paths": {
    "jquery": "../bower_components/jquery/dist/jquery",
    "URIjs": "../bower_components/uri.js/src",
    "lodash": "../bower_components/lodash/lodash",

    "raw-knockout": "../bower_components/knockout/dist/knockout",
    "knockout": "lib-wrappers/knockout",

    "raw-rollbar": "../bower_components/rollbar/dist/rollbar.amd",
    "rollbar": "lib-wrappers/rollbar",

    "config": "config/" + configPrefix + "-rivet-config"
  }
});