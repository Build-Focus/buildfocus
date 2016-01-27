'use strict';

import ko = require("knockout");
import config = require("config");

function now() {
  return new Date().valueOf();
}

class Timer {
  private runningTimerId: KnockoutObservable<number> = ko.observable(null);
  private fullDuration: number = null;

  progress: KnockoutComputed<number> = ko.pureComputed(() => {
    if (this.timeRemaining() !== null) {
      return Math.floor((1 - (this.timeRemaining() / this.fullDuration)) * 100);
    } else {
      return null;
    }
  });
  timeRemaining: KnockoutObservable<number> = ko.observable(null);
  isRunning: KnockoutComputed<boolean> = ko.pureComputed(() => {
    return this.runningTimerId() !== null;
  });

  start(duration: number, callback: () => void) {
    this.reset();

    this.fullDuration = duration;
    this.timeRemaining(duration);

    var timerStartTime = now();
    var timerEndTime = timerStartTime + duration;

    this.runningTimerId(window.setInterval(() => {
      this.timeRemaining(timerEndTime - now());

      if (now() >= timerEndTime) {
        this.stopTimer();
        if (callback) {
          callback();
        }
      }
    }, config.timerFrequency));
  }

  private stopTimer() {
    if (this.runningTimerId()) {
      window.clearInterval(this.runningTimerId());
      this.runningTimerId(null);
    }
  }

  reset() {
    this.stopTimer();
    this.fullDuration = null;
    this.timeRemaining(null);
  }
}


export = Timer;