'use strict';

import ko = require("knockout");
import publishedObservable = require("observables/published-observable");
import subscribableEvent = require("subscribable-event");
import Timer = require("pomodoro/timer");
import config = require("config");

export = function PomodoroService(badBehaviourMonitor) {
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

  chrome.runtime.onMessage.addListener(function (message) {
    if (message.action === "start-pomodoro") {
      self.start();
    } else if (message.action === "start-break") {
      self.takeABreak();
    }
  });

  self.isActive = publishedObservable("pomodoro-is-active", pomodoroTimer.isRunning);
  self.isBreakActive = publishedObservable("break-is-active", breakTimer.isRunning);

  var rawProgress = ko.computed(function () {
    if (pomodoroTimer.isRunning()) {
      return pomodoroTimer.progress();
    } else if (breakTimer.isRunning()) {
      return breakTimer.progress();
    } else {
      return null;
    }
  });

  self.progress = publishedObservable("pomodoro-service-progress", rawProgress);

  self.onPomodoroStart = subscribableEvent();
  self.onPomodoroSuccess = subscribableEvent();
  self.onPomodoroFailure = subscribableEvent();

  self.onBreakStart = subscribableEvent();
  self.onBreakEnd = subscribableEvent();
};