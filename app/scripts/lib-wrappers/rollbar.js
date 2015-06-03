'use strict';

define(["raw-rollbar", "config"], function (Rollbar, config) {
  return Rollbar.init(config.rollbarConfig);
});