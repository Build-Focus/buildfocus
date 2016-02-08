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
    "createjs": "../bower_components/easeljs/lib/easeljs-0.8.2.combined",
    "heap": "../bower_components/heap/lib/heap",
    "hopscotch": "../bower_components/hopscotch/dist/js/hopscotch",
    "moment": "../bower_components/moment/moment",

    "raw-knockout": "../bower_components/knockout/dist/knockout",
    "knockout-es5": "../bower_components/knockout-es5/dist/knockout-es5",
    "knockout": "lib-wrappers/knockout",

    "raw-rollbar": "../bower_components/rollbar/dist/rollbar.amd",
    "rollbar": "lib-wrappers/rollbar",

    "raw-lodash": "../bower_components/lodash/lodash",
    "lodash": "lib-wrappers/lodash",

    "config": "config/" + configPrefix + "-config"
  },
  map: {
    'knockout-es5': {
      'knockout': 'raw-knockout'
    },
  },
  shim: {
    createjs: { exports: 'createjs' },
    tween: { deps: ['createjs'], exports: 'Tween' }
  },
  "waitSeconds": 60 // We're usually running in the background, and we can wait a little if the machine's slow
});

// Type definition for the app config, to promise to typescript that one of the prod/test/dev configs
// will solve its problems.
interface ApplicationConfig {
  pomodoroDuration: number;
  breakDuration: number;
  rollbarConfig: Object;
  trackingConfig: { enabled: boolean, extraInfo: {} };
  timerFrequency: number;
}

declare var config: ApplicationConfig;

declare module "config" {
  export = config;
}
