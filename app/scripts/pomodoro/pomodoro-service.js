'use strict';

define(["pomodoro/timer"], function (Timer) {
  return function PomodoroService(badBehaviourMonitor) {
    var timer = new Timer();

    this.start = function startPomodoro(onSuccess, onError) {
      timer.start(1000 * 60 * 20, function () {
        badBehaviourMonitor.removeBadBehaviourCallback(badBehaviourRegistration);

        onSuccess();
      });

      var badBehaviourRegistration = badBehaviourMonitor.onBadBehaviour(function () {
        timer.reset();
        badBehaviourMonitor.removeBadBehaviourCallback(badBehaviourRegistration);

        onError();
      });
    };

    this.isActive = timer.isRunning;
  };
});