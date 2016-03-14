'use strict';

import ko = require("knockout");
import publishedObservable = require("observables/published-observable");
import subscribableEvent = require("subscribable-event");
import Timer = require("pomodoro/timer");
import config = require("config");
import PomodoroState = require("pomodoro/pomodoro-state");

import BadBehaviourMonitor = require('url-monitoring/bad-behaviour-monitor');

import tracking = require('tracking/tracking');

class PomodoroService {
  private pomodoroTimer = new Timer();
  private breakTimer = new Timer();

  onPomodoroStart = subscribableEvent();
  onPomodoroSuccess = subscribableEvent();
  onPomodoroFailure = subscribableEvent<number, string>();

  onBreakStart = subscribableEvent();
  onBreakEnd = subscribableEvent();

  private state = publishedObservable("pomodoro-service-state", ko.pureComputed(() => {
    if (this.pomodoroTimer.isRunning()) return PomodoroState.Active;
    else if (this.pomodoroTimer.isPaused()) return PomodoroState.Paused;
    else if (this.breakTimer.isRunning()) return PomodoroState.Break;
    else return PomodoroState.Inactive;
  }));

  isActive =      ko.pureComputed(() => this.state() === PomodoroState.Active);
  isPaused =      ko.pureComputed(() => this.state() === PomodoroState.Paused);
  isBreakActive = ko.pureComputed(() => this.state() === PomodoroState.Break);
  isInactive =    ko.pureComputed(() => this.state() === PomodoroState.Inactive);

  timeRemaining = publishedObservable("pomodoro-service-time-remaining", ko.pureComputed(() => {
    if (this.isActive() || this.isPaused()) {
      return this.pomodoroTimer.timeRemaining();
    } else if (this.isBreakActive()) {
      return this.breakTimer.timeRemaining();
    } else {
      return null;
    }
  }));

  progress = ko.pureComputed(() => {
    if (this.isActive() || this.isPaused()) {
      return this.pomodoroTimer.progress();
    } else if (this.isBreakActive()) {
      return this.breakTimer.progress();
    } else {
      return null;
    }
  });

  constructor(private badBehaviourMonitor: BadBehaviourMonitor) {
    // TODO: This should probably be refactored out elsewhere:
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === "start-pomodoro") this.start();
      else if (message.action === "start-break") this.takeABreak();
    });
  }

  private badTabSubscription: TriggerableKnockoutSubscription;

  start = () => {
    if (this.isActive()) return;

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

  private failPomodoro(tabId, url) {
    this.reset();
    this.onPomodoroFailure.trigger(tabId, url);
    tracking.trackEvent("failure", { "failure_url": url });
  }

  reset() {
    if (this.badTabSubscription) this.badTabSubscription.dispose();
    this.pomodoroTimer.reset();
    this.breakTimer.reset();
  }

  pause() {
    if (this.isActive()) {
      this.pomodoroTimer.pause();
      tracking.trackEvent("pomodoro.paused");
    }
  }

  resume() {
    if (this.isPaused()) {
      this.pomodoroTimer.resume();
      tracking.trackEvent("pomodoro.resumed");
    }
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