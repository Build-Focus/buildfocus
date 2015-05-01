'use strict';

define(["pomodoro/timer"], function (Timer) {
  var BREAK_DURATION = 1000 * 60 * 5;
  var POMODORO_DURATION = 1000 * 60 * 20;

  return function PomodoroService(badBehaviourMonitor) {
    var pomodoroTimer = new Timer();
    var breakTimer = new Timer();

    this.start = function startPomodoro(onSuccess, onError) {
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
  };
});