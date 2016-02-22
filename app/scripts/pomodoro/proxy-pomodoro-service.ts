'use strict';

import ko = require("knockout");
import subscribedObservable = require("observables/subscribed-observable");
import subscribableEvent = require("subscribable-event");
import PomodoroState = require("pomodoro/pomodoro-state");

class ProxyPomodoroService {
  start() {
    chrome.runtime.sendMessage({"action": "start-pomodoro"});
  }

  takeABreak() {
    chrome.runtime.sendMessage({"action": "start-break"});
  }

  private state = subscribedObservable("pomodoro-service-state", PomodoroState.Inactive);

  isActive =      ko.pureComputed(() => this.state() === PomodoroState.Active);
  isPaused =      ko.pureComputed(() => this.state() === PomodoroState.Paused);
  isBreakActive = ko.pureComputed(() => this.state() === PomodoroState.Break);
  isInactive =    ko.pureComputed(() => this.state() === PomodoroState.Inactive);

  timeRemaining = subscribedObservable("pomodoro-service-time-remaining", null);
}

export = ProxyPomodoroService;