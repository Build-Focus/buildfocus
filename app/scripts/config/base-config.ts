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

// Type definition for the app config, to promise to typescript that one of the prod/test/dev configs
// will solve its problems.
interface ApplicationConfig {
  pomodoroDuration: number;
  breakDuration: number;
  rollbarConfig: Object;
}

declare var config: ApplicationConfig;

declare module "config" {
  export = config;
}