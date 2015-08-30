'use strict';

define(["raw-rollbar", "config"], function (Rollbar, config) {
  var rollbar = Rollbar.init(config.rollbarConfig);

  // Lets us make a clear readable call that stops TypeScript from automatically dropping
  // Rollbar imports that don't get used. Sadly it's a totally useless call, but otherwise a lovely fix.
  rollbar.enable = () => rollbar;

  return rollbar;
});