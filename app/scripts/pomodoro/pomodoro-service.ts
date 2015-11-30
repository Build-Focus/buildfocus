'use strict';

import ko = require("knockout");
import publishedObservable = require("observables/published-observable");
import subscribableEvent = require("subscribable-event");
import Timer = require("pomodoro/timer");
import config = require("config");
import BadBehaviourMonitor = require('url-monitoring/bad-behaviour-monitor');

import tracking = require('tracking');

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

  private badTabSubscription: TriggerableKnockoutSubscription;

  start = () => {
    if (this.isActive()) {
      return;
    }

    this.onPomodoroStart.trigger();

    this.breakTimer.reset();

    this.pomodoroTimer.start(config.pomodoroDuration, () => {
      this.clearBehaviourSubscription();
      this.onPomodoroSuccess.trigger();
      tracking.trackEvent("success");
    });

    // Currently, if this triggers *immediately*, it can't unsubscribe (because the subscription is only available
    // after the return). Async is nasty; really we want: subscribe -> trigger now explicitly -> return;
    this.badTabSubscription = this.badBehaviourMonitor.currentBadTabs.triggerableSubscribe((tabs) => {
      if (tabs.length > 0) {
        var firstBadTab = this.badBehaviourMonitor.currentBadTabs()[0];
        this.failPomodoro(firstBadTab.id, firstBadTab.url);
      }
    });
    this.badTabSubscription.trigger();
  };

  private clearBehaviourSubscription() {
    if (this.badTabSubscription) {
      this.badTabSubscription.dispose();
    }
  }

  private failPomodoro(tabId, url) {
    this.clearBehaviourSubscription();
    this.pomodoroTimer.reset();
    this.onPomodoroFailure.trigger(tabId, url);
    tracking.trackEvent("failure", { failureUrl: url });
  }

  takeABreak = () => {
    if (this.isActive()) {
      return;
    }

    this.breakTimer.start(config.breakDuration, () => {
      this.onBreakEnd.trigger();
      tracking.trackEvent("break-finished");
    });
    this.onBreakStart.trigger();
  }
}

export = PomodoroService;