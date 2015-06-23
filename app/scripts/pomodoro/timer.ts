'use strict';

import ko = require("knockout");

function now() {
  return new Date().valueOf();
}

export = function Timer () {
  var self = this;

  var runningTimerId = ko.observable(null);

  self.start = function (duration, callback) {
    self.reset();

    var timerStartTime = now();
    var timerEndTime = timerStartTime + duration;

    runningTimerId(window.setInterval(function () {
      var rawProgress = (now() - timerStartTime) / duration;
      self.progress(Math.floor(rawProgress * 100));

      if (now() >= timerEndTime) {
        stopTimer();
        if (callback) {
          callback();
        }
      }
    }, 100));
  };

  function stopTimer() {
    if (runningTimerId()) {
      window.clearInterval(runningTimerId());
      runningTimerId(null);
    }
  }

  self.reset = function () {
    stopTimer();
    self.progress(0);
  };

  self.isRunning = ko.computed(function () {
    return runningTimerId() !== null;
  });

  self.progress = ko.observable(0);
};