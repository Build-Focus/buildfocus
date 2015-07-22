'use strict';

import ko = require("knockout");

function now() {
  return new Date().valueOf();
}

class Timer {
  private runningTimerId: KnockoutObservable<number> = ko.observable(null);

  progress: KnockoutObservable<number> = ko.observable(0);
  isRunning: KnockoutComputed<boolean> = ko.computed(() => {
    return this.runningTimerId() !== null;
  });

  start(duration: number, callback: () => void) {
    this.reset();

    var timerStartTime = now();
    var timerEndTime = timerStartTime + duration;

    this.runningTimerId(window.setInterval(() => {
      var rawProgress = (now() - timerStartTime) / duration;
      this.progress(Math.floor(rawProgress * 100));

      if (now() >= timerEndTime) {
        this.stopTimer();
        if (callback) {
          callback();
        }
      }
    }, 100));
  }

  private stopTimer() {
    if (this.runningTimerId()) {
      window.clearInterval(this.runningTimerId());
      this.runningTimerId(null);
    }
  }

  reset() {
    this.stopTimer();
    this.progress(0);
  }
}


export = Timer;