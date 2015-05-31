'use strict';

define(["knockout", "pomodoro/timer", "config"], function (ko, Timer, config) {
  return function PomodoroService(badBehaviourMonitor) {
    var pomodoroTimer = new Timer();
    var breakTimer = new Timer();

    this.start = function startPomodoro(onSuccess, onError) {
      if (this.isActive()) {
        throw new Error("Pomodoro started while one is already active!");
      }

      breakTimer.reset();
      pomodoroTimer.start(config.pomodoroDuration, function () {
        badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

        onSuccess();
      });

      var badBehaviourRegistration = badBehaviourMonitor.onBadBehaviour(function () {
        pomodoroTimer.reset();
        badBehaviourMonitor.onBadBehaviour.remove(badBehaviourRegistration);

        onError();
      });
    };

    this.takeABreak = function takeABreak(callback) {
      pomodoroTimer.reset();
      breakTimer.start(config.breakDuration, callback);
    };

    this.isActive = pomodoroTimer.isRunning;

    this.progress = ko.computed(function () {
      if (pomodoroTimer.isRunning()) {
        return pomodoroTimer.progress();
      } else if (breakTimer.isRunning()) {
        return breakTimer.progress();
      } else {
        return null;
      }
    });
  };
});