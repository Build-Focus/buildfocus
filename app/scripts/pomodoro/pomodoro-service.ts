'use strict';

import ko = require("knockout");
import publishedObservable = require("observables/published-observable");
import subscribableEvent = require("subscribable-event");
import Timer = require("pomodoro/timer");
import config = require("config");
import BadBehaviourMonitor = require('url-monitoring/bad-behaviour-monitor');

class PomodoroService {
  private badBehaviourMonitor: BadBehaviourMonitor;
  private pomodoroTimer = new Timer();
  private breakTimer = new Timer();

  onPomodoroStart = subscribableEvent();
  onPomodoroSuccess = subscribableEvent();
  onPomodoroFailure = subscribableEvent<number, string>();

  onBreakStart = subscribableEvent();
  onBreakEnd = subscribableEvent();

  isActive = publishedObservable("pomodoro-is-active", this.pomodoroTimer.isRunning);
  isBreakActive = publishedObservable("break-is-active", this.breakTimer.isRunning);
  progress = publishedObservable("pomodoro-service-progress", ko.computed(() => {
    if (this.pomodoroTimer.isRunning()) {
      return this.pomodoroTimer.progress();
    } else if (this.breakTimer.isRunning()) {
      return this.breakTimer.progress();
    } else {
      return null;
    }
  }));

  constructor(badBehaviourMonitor: BadBehaviourMonitor) {
    this.badBehaviourMonitor = badBehaviourMonitor;

    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "start-pomodoro") {
        this.start();
      } else if (message.action === "start-break") {
        this.takeABreak();
      }
    });
  }

  start = () => {
    if (this.isActive()) {
      return;
    }

    this.breakTimer.reset();
    this.pomodoroTimer.start(config.pomodoroDuration, () => {
      this.badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

      this.onPomodoroSuccess.trigger();
    });

    var badBehaviourRegistration = this.badBehaviourMonitor.onBadBehaviour((tabId, url) => {
      this.pomodoroTimer.reset();
      this.badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

      this.onPomodoroFailure.trigger(tabId, url);
    });

    this.onPomodoroStart.trigger();
  };

  takeABreak = () => {
    if (this.isActive()) {
      return;
    }

    this.breakTimer.start(config.breakDuration, this.onBreakEnd.trigger);
    this.onBreakStart.trigger();
  }
}

export = PomodoroService;