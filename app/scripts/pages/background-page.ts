'use strict';

import ko = require("knockout");
import _ = require("lodash");
import moment = require("moment");

import tracking = require('tracking/tracking');
import getUserIdentity = require("tracking/get-user-identity");

import storeOnce = require('chrome-utilities/store-once');
import reportChromeErrors = require('chrome-utilities/report-chrome-errors');
import messageEvent = require("data-synchronization/message-event");

import Score = require("score");
import SettingsRepository = require("settings-repository");
import PomodoroService = require("pomodoro/pomodoro-service");

import TabsMonitor = require("url-monitoring/tabs-monitor");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");

import { MetricsRepository } from "metrics/metrics-repository";

import IdleMonitor = require("idle-monitoring/idle-monitor");
import GoneMonitor = require("idle-monitoring/gone-monitor");

import FocusButton = require("ui-components/focus-button");
import NotificationService = require("ui-components/notification-service");
import indicateFailure = require("ui-components/failure-indicator");
import BadTabsWarningService = require("bad-tabs-warning/bad-tabs-warning-service");

import renderableConfigLoader = require('city/rendering/config/config-loader');

import { showMainPage, showFailurePage } from "chrome-utilities/page-opener";

var onStartPomodoroMessage = messageEvent({ action: "start-pomodoro" });
var onStartBreakMessage = messageEvent({ action: "start-break" });

function setupPomodoroWorkflow(notificationService: NotificationService,
                               badTabsWarningService: BadTabsWarningService,
                               pomodoroService: PomodoroService,
                               resetPrompts: () => void) {
  var score = new Score();

  onStartPomodoroMessage(pomodoroService.start);
  notificationService.onPomodoroStart(pomodoroService.start);

  pomodoroService.onPomodoroStart(resetPrompts);

  pomodoroService.onPomodoroSuccess(() => {
    var newBuilding = score.addSuccess();
    notificationService.showSuccessNotification(newBuilding);
  });

  pomodoroService.onPomodoroFailure((tabId, url) => {
    score.addFailure();
    indicateFailure(tabId, url);
  });

  notificationService.onRejectResult((building) => {
    score.rejectSuccess(building);
    showFailurePage();
  });
}

function setupBreaks(notificationService: NotificationService, pomodoroService: PomodoroService, resetPrompts: () => void) {
  notificationService.onBreak(pomodoroService.takeABreak);
  onStartBreakMessage(pomodoroService.takeABreak);

  pomodoroService.onBreakStart(resetPrompts);
  pomodoroService.onBreakEnd(notificationService.showBreakNotification);
}

function setupIdleHandling(settings: SettingsRepository, pomodoroService: PomodoroService) {
  // You're Idle if you lock your machine, or touch nothing for idleTimeout millis (default 90 seconds)
  var idleMonitor = new IdleMonitor(settings);
  idleMonitor.onIdle(() => pomodoroService.pause());
  idleMonitor.onActive(() => pomodoroService.resume());

  // You're Gone if you stay idle for goneTimeout millis (default 15 minutes)
  var goneMonitor = new GoneMonitor(idleMonitor);
  goneMonitor.onGone(() => pomodoroService.reset());
}

function setupFocusButton(pomodoroService: PomodoroService) {
  var focusButton = new FocusButton(pomodoroService);
  focusButton.onClick(() => {
    tracking.trackEvent("open-page-from-focus-button");
    showMainPage();
  });
}

function setupMetrics(notificationService: NotificationService, pomodoroService: PomodoroService) {
  var metrics = new MetricsRepository();
  pomodoroService.onPomodoroSuccess(() => metrics.recordSuccess(moment()));
  pomodoroService.onPomodoroFailure(() => metrics.recordFailure(moment()));
  notificationService.onRejectResult(() => metrics.recordRejectedSuccess());
}

export = function setupBackgroundPage() {
  var settings = new SettingsRepository();
  var activeTabs = new TabsMonitor().activeTabs;
  var allTabs = new TabsMonitor().allTabs;

  var pomodoroService = new PomodoroService(new BadBehaviourMonitor(activeTabs, settings));
  var notificationService = new NotificationService(renderableConfigLoader);
  var badTabsWarningService = new BadTabsWarningService(new BadBehaviourMonitor(allTabs, settings), allTabs, showMainPage);

  var resetPrompts = () => {
    badTabsWarningService.reset();
    notificationService.reset();
  };

  setupPomodoroWorkflow(notificationService, badTabsWarningService, pomodoroService, resetPrompts);
  setupBreaks(notificationService, pomodoroService, resetPrompts);

  setupIdleHandling(settings, pomodoroService);
  setupFocusButton(pomodoroService);
  setupMetrics(notificationService, pomodoroService);

  notificationService.onShowResult(showMainPage);

  // TODO: Refactor this into a tracking.initialize style method?
  storeOnce.isSetLocally("first-install-time", true).then((hasBeenInstalled) => {
    if (!hasBeenInstalled) {
      showMainPage();
      tracking.trackEvent("first-install");
    }
  });

  getUserIdentity().then((userIdentity) => {
    chrome.runtime.setUninstallURL(`https://buildfocus.typeform.com/to/UE6H0L?id=${userIdentity.userId}`,
      () => reportChromeErrors("Error setting uninstall URL"));
  });
}
