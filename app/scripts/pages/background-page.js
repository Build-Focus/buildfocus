'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/current-urls",
         "pomodoro/pomodoro-service", "focus-button", "url-monitoring/bad-behaviour-monitor",
         "score", "notification-service"],
  function (ko, _, settings, currentUrls, PomodoroService, FocusButton,
            BadBehaviourMonitor, score, NotificationService) {
    var notificationService = new NotificationService();
    var badBehaviourMonitor = new BadBehaviourMonitor(currentUrls, settings);
    var pomodoroService = new PomodoroService(badBehaviourMonitor);
    var button = new FocusButton(score.points, pomodoroService.isActive);

    function onSuccess() {
      score.addSuccess();
      notificationService.showSuccessNotification();
    }

    function onFailure() {
      score.addFailure();
      chrome.tabs.executeScript(null, {file: "scripts/failure-content-script.js",
                                       runAt: "document_start"});
    }

    function startPomodoro() {
      if (!pomodoroService.isActive()) {
        pomodoroService.start(onSuccess, onFailure);
      }
    }

    function takeABreak() {
      pomodoroService.takeABreak(function () {
        notificationService.showBreakNotification();
      });
    }

    button.onClick(startPomodoro);
    notificationService.onClick(startPomodoro);
    notificationService.onBreak(takeABreak);
  }
);