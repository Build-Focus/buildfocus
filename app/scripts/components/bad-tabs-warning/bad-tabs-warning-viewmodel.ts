import ko = require('raw-knockout');

import SettingsRepository = require("repositories/settings-repository");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");
import Tab = require("url-monitoring/tab");
import ProxyPomodoroService = require("pomodoro/proxy-pomodoro-service");

import closeCurrentTab = require("chrome-utilities/close-current-tab");
import reportChromeErrors = require('chrome-utilities/report-chrome-errors');
import tracking = require('tracking/tracking');

import BadTabsWarningAction = require('components/bad-tabs-warning/bad-tabs-warning-action');

class BadTabsWarningViewModel {
  private badBehaviourMonitor = new BadBehaviourMonitor(this.tabsToMonitor, this.settings);

  private triggered = ko.observable(false);

  rememberInFuture = ko.observable(false);

  constructor(private pomodoroService: ProxyPomodoroService,
              private tabsToMonitor: KnockoutObservableArray<Tab>,
              private settings: SettingsRepository) {
    // Automatically deactivate if the pomodoro stops
    this.pomodoroService.isActive.subscribe((newValue) => {
      if (newValue === false) this.triggered(false);
    });
  }

  trigger() {
    tracking.trackEvent("tabs-warning.trigger", { configuration: this.settings.badTabsWarningAction });

    switch (this.settings.badTabsWarningAction()) {
      case BadTabsWarningAction.Prompt:
        this.triggered(true);
        return;
      case BadTabsWarningAction.CloseThem:
        this.closeDistractingTabs();
        return;
      case BadTabsWarningAction.LeaveThem:
        this.leaveDistractingTabs();
        return;
    }
  }

  dismiss() {
    this.triggered(false);
    this.rememberInFuture(false);
  }

  shouldShowIfTriggered = ko.pureComputed(() => {
    return this.badBehaviourMonitor.currentBadTabs().length > 0;
  });

  isShowing = ko.computed<Boolean>(() => {
    if (this.triggered() && this.shouldShowIfTriggered()) {
      return true;
    } else {
      // Turn off completely if we were triggered before, but are now invalid.
      this.dismiss();
      return false;
    }
  });

  closeDistractingTabs() {
    var tabsToRemove = this.badBehaviourMonitor.currentBadTabs();
    chrome.tabs.remove(tabsToRemove.map((t) => t.id), () => reportChromeErrors);

    if (this.rememberInFuture()) this.settings.badTabsWarningAction(BadTabsWarningAction.CloseThem);

    this.dismiss();

    tracking.trackEvent("tabs-warning.close-tabs", {
      configuration: this.settings.badTabsWarningAction,
      remember: this.rememberInFuture()
    }).then(() => closeCurrentTab());
  }

  leaveDistractingTabs() {
    if (this.rememberInFuture()) this.settings.badTabsWarningAction(BadTabsWarningAction.LeaveThem);
    this.dismiss();

    tracking.trackEvent("tabs-warning.leave-tabs", {
      configuration: this.settings.badTabsWarningAction,
      remember: this.rememberInFuture()
    });
  }

}

export = BadTabsWarningViewModel;
