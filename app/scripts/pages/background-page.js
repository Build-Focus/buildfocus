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
      notificationService.clearNotifications();
      if (!pomodoroService.isActive()) {
        pomodoroService.start(onSuccess, onFailure);
      }
    }

    function takeABreak() {
      notificationService.clearNotifications();
      pomodoroService.takeABreak(function () {
        notificationService.showBreakNotification();
      });
    }

    function showRivetPage() {
      chrome.tabs.create({
        url: chrome.extension.getURL("rivet.html")
      });
    }

    notificationService.onClick(startPomodoro);
    notificationService.onBreak(takeABreak);
    notificationService.onMore(showRivetPage);
    focusButton.onClick(showRivetPage);

    chrome.extension.onMessage.addListener(function (message) {
      if (message.action === "start-pomodoro") {
        startPomodoro();
      } else if (message.action === "start-break") {
        takeABreak();
      } else {
        throw new Error("Message received with unknown action: " + message.action);
      }
    });
  }
);