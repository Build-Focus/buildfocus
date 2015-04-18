'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/current-urls",
         "pomodoro/pomodoro-service", "focus-button", "url-monitoring/bad-behaviour-monitor",
         "score"],
  function (ko, _, settings, currentUrls, PomodoroService, FocusButton, BadBehaviourMonitor, score) {
    var badBehaviourMonitor = new BadBehaviourMonitor(currentUrls, settings);
    var pomodoroService = new PomodoroService(badBehaviourMonitor);
    var button = new FocusButton(score.points, pomodoroService.isActive);

    button.onClick(function () {
      pomodoroService.start(score.addSuccess, score.addFailure);
    });
  }
);