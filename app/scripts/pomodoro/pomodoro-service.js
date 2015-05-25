'use strict';

define(["knockout", "pomodoro/timer"], function (ko, Timer) {
  var BREAK_DURATION = 1000 * 60 * 5;
  var POMODORO_DURATION = 1000 * 60 * 20;

  return function PomodoroService(badBehaviourMonitor) {
    var pomodoroTimer = new Timer();
    var breakTimer = new Timer();

    this.start = function startPomodoro(onSuccess, onError) {
      if (this.isActive()) {
        throw new Error("Pomodoro started while one is already active!");
      }

      breakTimer.reset();
      pomodoroTimer.start(POMODORO_DURATION, function () {
        badBehaviourMonitor.removeBadBehaviourCallback(badBehaviourRegistration);

        onSuccess();
      });

      var badBehaviourRegistration = badBehaviourMonitor.onBadBehaviour(function () {
        pomodoroTimer.reset();
        badBehaviourMonitor.removeBadBehaviourCallback(badBehaviourRegistration);

        onError();
      });
    };

    this.takeABreak = function takeABreak(callback) {
      pomodoroTimer.reset();
      breakTimer.start(BREAK_DURATION, callback);
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