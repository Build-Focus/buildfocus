'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/current-urls",
         "pomodoro/pomodoro-service", "focus-button", "url-monitoring/bad-behaviour-monitor"],
  function (ko, _, settings, currentUrls, PomodoroService, FocusButton, BadBehaviourMonitor) {
    var badBehaviourMonitor = new BadBehaviourMonitor(currentUrls, settings);
    var pomodoroService = new PomodoroService(badBehaviourMonitor);

    var points = ko.observable(0);
    var button = new FocusButton(points, pomodoroService.isActive);

    function onSuccess() {
      points(points() + 1);
    }

    function onFailure() {
      points(points() - 1);
    }

    button.onClick(function () {
      pomodoroService.start(onSuccess, onFailure);
    });
  }
);