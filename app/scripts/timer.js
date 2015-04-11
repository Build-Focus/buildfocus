'use strict';

define(["knockout"], function (ko) {
  return function Timer () {
    var self = this;
    var runningTimerId = null;
    self.isRunning = ko.observable(false);

    self.start = function (duration, callback) {
      if (self.isRunning()) {
        self.reset();
      }

      self.isRunning(true);
      window.setTimeout(function () {
        self.isRunning(false);
        if (callback) {
          callback();
        }
      }, duration);
    };

    self.reset = function () {
      window.clearTimeout(runningTimerId);
      runningTimerId = null;
      self.isRunning(false);
    };
  };
});