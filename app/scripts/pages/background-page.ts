'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/current-urls",
         "pomodoro/pomodoro-service", "focus-button", "url-monitoring/bad-behaviour-monitor",
         "score", "notification-service", "rollbar"],
  function (ko, _, settings, currentUrls, PomodoroService, FocusButton,
            BadBehaviourMonitor, score, NotificationService) {
    var notificationService = new NotificationService();
    var badBehaviourMonitor = new BadBehaviourMonitor(currentUrls, settings);
    var pomodoroService = new PomodoroService(badBehaviourMonitor);
    var focusButton = new FocusButton(pomodoroService.progress, pomodoroService.isActive);

    notificationService.onClick(pomodoroService.start);
    pomodoroService.onPomodoroStart(notificationService.clearNotifications);

    pomodoroService.onPomodoroSuccess(function () {
      score.addSuccess();
      notificationService.showSuccessNotification();
    });

    pomodoroService.onPomodoroFailure(function () {
      score.addFailure();
      chrome.tabs.executeScript(null, {file: "scripts/failure-content-script.js",
                                       runAt: "document_start"});
    });

    notificationService.onBreak(pomodoroService.takeABreak);
    pomodoroService.onBreakStart(notificationService.clearNotifications);
    pomodoroService.onBreakEnd(notificationService.showBreakNotification);

    function showRivetPage() {
      chrome.tabs.create({ url: chrome.extension.getURL("rivet.html") });
    }

    focusButton.onClick(showRivetPage);
    notificationService.onMore(showRivetPage);
  }
);