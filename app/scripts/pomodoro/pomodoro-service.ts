'use strict';

import ko = require("knockout");
import publishedObservable = require("observables/published-observable");
import subscribableEvent = require("subscribable-event");
import Timer = require("pomodoro/timer");
import config = require("config");

import BadBehaviourMonitor = require('url-monitoring/bad-behaviour-monitor');
import IdleMonitor = require("idle-monitor");

import tracking = require('tracking/tracking');

class PomodoroService {
  private pomodoroTimer = new Timer();
  private breakTimer = new Timer();

  onPomodoroStart = subscribableEvent();
  onPomodoroSuccess = subscribableEvent();
  onPomodoroFailure = subscribableEvent<number, string>();

  onBreakStart = subscribableEvent();
  onBreakEnd = subscribableEvent();

  isActive = publishedObservable("pomodoro-is-active", this.pomodoroTimer.isRunning);
  isPaused = publishedObservable("pomodoro-is-paused", this.pomodoroTimer.isPaused);
  isBreakActive = publishedObservable("break-is-active", this.breakTimer.isRunning);
  timeRemaining = publishedObservable("pomodoro-service-time-remaining", ko.pureComputed(() => {
    if (this.pomodoroTimer.isRunning()) {
      return this.pomodoroTimer.timeRemaining();
    } else if (this.breakTimer.isRunning()) {
      return this.breakTimer.timeRemaining();
    } else {
      return null;
    }
  }));

  progress = ko.pureComputed(() => {
    if (this.pomodoroTimer.isRunning()) {
      return this.pomodoroTimer.progress();
    } else if (this.breakTimer.isRunning()) {
      return this.breakTimer.progress();
    } else {
      return null;
    }
  });

  constructor(private badBehaviourMonitor: BadBehaviourMonitor, private idleMonitor: IdleMonitor) {
    this.setupIdleHandling();

    // TODO: This should probably be refactored out elsewhere:
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "start-pomodoro") {
        this.start();
      } else if (message.action === "start-break") {
        this.takeABreak();
      }
    });
  }

  private setupIdleHandling() {
    var totallyIdleCallbackId: number = null;

    this.idleMonitor.onIdle(() => {
      if (this.pomodoroTimer.isRunning()) {
        totallyIdleCallbackId = setTimeout(() => this.reset(), config.totallyIdleTimeout);
        this.pomodoroTimer.pause();
      }
    });

    this.idleMonitor.onActive(() => {
      if (this.pomodoroTimer.isPaused()) {
        clearTimeout(totallyIdleCallbackId);
        this.pomodoroTimer.resume();
      }
    });
  }

  private badTabSubscription: TriggerableKnockoutSubscription;

  start = () => {
    if (this.isActive()) {
      return;
    }

    this.breakTimer.reset();
    this.pomodoroTimer.start(config.pomodoroDuration, () => {
      this.onPomodoroSuccess.trigger();
      this.reset();
      tracking.trackEvent("success");
    });
    this.onPomodoroStart.trigger();

    this.badTabSubscription = this.badBehaviourMonitor.currentBadTabs.triggerableSubscribe((tabs) => {
      if (tabs.length > 0) {
        var firstBadTab = this.badBehaviourMonitor.currentBadTabs()[0];
        this.failPomodoro(firstBadTab.id, firstBadTab.url);
      }
    });
    // Needs to be separate (not just trigger + subscribe above), so we can unsubscribe within the trigger itself
    this.badTabSubscription.trigger();
  };

  private reset() {
    if (this.badTabSubscription) this.badTabSubscription.dispose();
    this.pomodoroTimer.reset();
    this.breakTimer.reset();
  }

  private failPomodoro(tabId, url) {
    this.reset();
    this.onPomodoroFailure.trigger(tabId, url);
    tracking.trackEvent("failure", { "failure_url": url });
  }

  takeABreak = () => {
    if (this.isActive() || this.isPaused()) return;

    this.breakTimer.start(config.breakDuration, () => {
      this.onBreakEnd.trigger();
      this.reset();
      tracking.trackEvent("break-finished");
    });
    this.onBreakStart.trigger();
  }
}

export = PomodoroService;