'use strict';

import ko = require("knockout");
import subscribedObservable = require("subscribed-observable");
import subscribableEvent = require("subscribable-event");

class ProxyPomodoroService {
  start() {
    chrome.runtime.sendMessage({"action": "start-pomodoro"});
  }

  takeABreak() {
    chrome.runtime.sendMessage({"action": "start-break"});
  }

  isActive = subscribedObservable("pomodoro-is-active", false);
  isBreakActive = subscribedObservable("break-is-active", false);
  progress = subscribedObservable("pomodoro-service-progress", null);

  onPomodoroStart = subscribableEvent();
  onPomodoroSuccess = subscribableEvent();
  onPomodoroFailure = subscribableEvent();

  onBreakStart = subscribableEvent();
  onBreakEnd = subscribableEvent();
};

export = ProxyPomodoroService;