'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/current-urls",
         "pomodoro/pomodoro-service", "focus-button", "url-monitoring/bad-behaviour-monitor",
         "score", "notification-service"],
  function (ko, _, settings, currentUrls, PomodoroService, FocusButton,
            BadBehaviourMonitor, score, NotificationService) {
    var notificationService = new NotificationService();
    var badBehaviourMonitor = new BadBehaviourMonitor(currentUrls, settings);
    var pomodoroService = new PomodoroService(badBehaviourMonitor);
    var focusButton = new FocusButton(pomodoroService.progress, pomodoroService.isActive);

    pomodoroService.onPomodoroSuccess(function () {
      score.addSuccess();
      notificationService.showSuccessNotification();
    });

    pomodoroService.onPomodoroFailure(function () {
      score.addFailure();
      chrome.tabs.executeScript(null, {file: "scripts/failure-content-script.js",
                                       runAt: "document_start"});
    });

    pomodoroService.onBreakEnd(function () {
      notificationService.showBreakNotification();
    });

    function showRivetPage() {
      chrome.tabs.create({
        url: chrome.extension.getURL("rivet.html")
      });
    }

    notificationService.onClick(pomodoroService.start);
    notificationService.onBreak(pomodoroService.takeABreak);
    notificationService.onMore(showRivetPage);

    focusButton.onClick(showRivetPage);
  }
);