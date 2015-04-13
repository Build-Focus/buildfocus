'use strict';

define(["knockout"], function (ko) {
  return function Timer () {
    var self = this;
    var runningTimerId = ko.observable(null);

    self.start = function (duration, callback) {
      if (runningTimerId()) {
        self.reset();
      }

      runningTimerId(window.setTimeout(function () {
        runningTimerId(null);
        if (callback) {
          callback();
        }
      }, duration));
    };

    self.reset = function () {
      window.clearTimeout(runningTimerId());
      runningTimerId(null);
    };

    self.isRunning = ko.computed(function () {
      return runningTimerId() !== null;
    });
  };
});