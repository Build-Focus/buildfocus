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
    return this.runningTimerId() !== null && !this.isPaused();
  });
  isPaused = ko.observable(false);

  start(duration: number, callback: () => void) {
    this.reset();

    this.fullDuration = duration;
    this.timeRemaining(duration);

    var timerStartTime = now();
    var timerEndTime = timerStartTime + duration;

    this.runningTimerId(window.setInterval(() => {
      if (this.isPaused()) {
        // Keep shifting our end time back while we're paused
        timerEndTime = now() + this.timeRemaining();
      } else {
        // Tick down towards our end time (never letting time remaining go below 0)
        this.timeRemaining(Math.max(timerEndTime - now(), 0));

        if (this.timeRemaining() === 0) {
          this.stopTimer();
          if (callback) callback();
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

  pause() {
    if (this.isRunning()) this.isPaused(true);
  }

  resume() {
    this.isPaused(false);
  }

  reset() {
    this.stopTimer();
    this.fullDuration = null;
    this.timeRemaining(null);
    this.isPaused(false);
  }
}


export = Timer;