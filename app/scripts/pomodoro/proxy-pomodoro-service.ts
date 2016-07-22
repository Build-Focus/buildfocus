'use strict';

import ko = require("knockout");
import reportChromeErrors = require("chrome-utilities/report-chrome-errors");
import subscribedObservable = require("data-synchronization/subscribed-observable");
import { subscribableEvent } from "data-synchronization/subscribable-event";
import PomodoroState = require("pomodoro/pomodoro-state");

class ProxyPomodoroService {
  start() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({"action": "start-pomodoro"}, (response) => {
        var error = reportChromeErrors("Failed to send start-pomodoro message");

        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  takeABreak() {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({"action": "start-break"}, (response) => {
        var error = reportChromeErrors("Failed to send start-break message");

        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  private state = subscribedObservable("pomodoro-service-state", PomodoroState.Inactive);

  isActive =      ko.pureComputed(() => this.state() === PomodoroState.Active);
  isPaused =      ko.pureComputed(() => this.state() === PomodoroState.Paused);
  isBreakActive = ko.pureComputed(() => this.state() === PomodoroState.Break);
  isInactive =    ko.pureComputed(() => this.state() === PomodoroState.Inactive);

  timeRemaining = subscribedObservable("pomodoro-service-time-remaining", null);
}

export = ProxyPomodoroService;
