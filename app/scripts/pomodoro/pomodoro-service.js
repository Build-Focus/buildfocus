'use strict';

define(["knockout", "synchronized-observable", "subscribable-event", "pomodoro/timer", "config"],
  function (ko, SynchronizedObservable, SubscribableEvent, Timer, config) {
    return function PomodoroService(badBehaviourMonitor) {
      var self = this;

      var pomodoroTimer = new Timer();
      var breakTimer = new Timer();

      self.start = function startPomodoro() {
        if (self.isActive()) {
          return;
        }

        breakTimer.reset();
        pomodoroTimer.start(config.pomodoroDuration, function () {
          badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

          self.onPomodoroSuccess.trigger();
        });

        var badBehaviourRegistration = badBehaviourMonitor.onBadBehaviour(function () {
          pomodoroTimer.reset();
          badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

          self.onPomodoroFailure.trigger();
        });

        self.onPomodoroStart.trigger();
      };

      self.takeABreak = function takeABreak() {
        if (self.isActive()) {
          return;
        }

        breakTimer.start(config.breakDuration, self.onBreakEnd.trigger);
        self.onBreakStart.trigger();
      };

      chrome.extension.onMessage.addListener(function (message) {
        if (message.action === "start-pomodoro") {
          self.start();
        } else if (message.action === "start-break") {
          self.takeABreak();
        }
      });

      self.isActive = new SynchronizedObservable("pomodoro-is-active", pomodoroTimer.isRunning);
      self.isBreakActive = new SynchronizedObservable("break-is-active", breakTimer.isRunning);

      var rawProgress = ko.computed(function () {
        if (pomodoroTimer.isRunning()) {
          return pomodoroTimer.progress();
        } else if (breakTimer.isRunning()) {
          return breakTimer.progress();
        } else {
          return null;
        }
      });

      self.progress = new SynchronizedObservable("pomodoro-service-progress", rawProgress);

      self.onPomodoroStart = new SubscribableEvent();
      self.onPomodoroSuccess = new SubscribableEvent();
      self.onPomodoroFailure = new SubscribableEvent();

      self.onBreakStart = new SubscribableEvent();
      self.onBreakEnd = new SubscribableEvent();
    };
  }
);