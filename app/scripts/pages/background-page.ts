'use strict';

import rollbar = require("rollbar");
import ko = require("knockout");
import _ = require("lodash");

import Score = require("score");
import SettingsRepository = require("repositories/settings-repository");
import currentUrls = require("url-monitoring/current-urls");
import PomodoroService = require("pomodoro/pomodoro-service");
import FocusButton = require("focus-button");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");
import NotificationService = require("notification-service");

export = function setupBackgroundPage() {
  var score = new Score();
  var settings = new SettingsRepository();
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
    chrome.tabs.executeScript(null, {
      file: "scripts/failure-content-script.js",
      runAt: "document_start"
    });
  });

  notificationService.onBreak(pomodoroService.takeABreak);
  pomodoroService.onBreakStart(notificationService.clearNotifications);
  pomodoroService.onBreakEnd(notificationService.showBreakNotification);

  function showMainPage() {
    chrome.tabs.create({url: chrome.extension.getURL("main.html")});
  }

  focusButton.onClick(showMainPage);
  notificationService.onMore(showMainPage);
}