'use strict';

define(["knockout", "synchronized-observable", "subscribable-event"],
  function (ko, SynchronizedObservable, SubscribableEvent) {
    return function ProxyPomodoroService() {
      var self = this;

      self.start = function startPomodoro() {
        chrome.extension.sendMessage({"action": "start-pomodoro"});
      };

      self.takeABreak = function takeABreak() {
        chrome.extension.sendMessage({"action": "start-break"});
      };

      self.isActive = new SynchronizedObservable("pomodoro-is-active", false);
      self.isBreakActive = new SynchronizedObservable("break-is-active", false);
      self.progress = new SynchronizedObservable("pomodoro-service-progress", null);

      self.onPomodoroStart = new SubscribableEvent();
      self.onPomodoroSuccess = new SubscribableEvent();
      self.onPomodoroFailure = new SubscribableEvent();

      self.onBreakStart = new SubscribableEvent();
      self.onBreakEnd = new SubscribableEvent();
    };
  }
);