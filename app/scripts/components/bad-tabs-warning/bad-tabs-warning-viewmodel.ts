import ko = require('raw-knockout');

import SettingsRepository = require("repositories/settings-repository");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");
import Tab = require("url-monitoring/tab");
import ProxyPomodoroService = require("pomodoro/proxy-pomodoro-service");

import closeCurrentTab = require("chrome-utilities/close-current-tab");
import reportChromeErrors = require('chrome-utilities/report-chrome-errors');

class BadTabsWarningViewModel {
  private badBehaviourMonitor = new BadBehaviourMonitor(this.tabsToMonitor, this.settings);

  private triggered = ko.observable(false);

  constructor(private pomodoroService: ProxyPomodoroService,
              private tabsToMonitor: KnockoutObservableArray<Tab>,
              private settings: SettingsRepository) {
    // Automatically deactivate if the pomodoro stops
    this.pomodoroService.isActive.subscribe((newValue) => {
      if (newValue === false) this.triggered(false);
    });
  }

  trigger() {
    this.triggered(true);
  }

  shouldShowIfTriggered = ko.pureComputed(() => {
    return this.badBehaviourMonitor.currentBadTabs().length > 0;
  });

  isShowing = ko.computed<Boolean>(() => {
    if (this.triggered() && this.shouldShowIfTriggered()) {
      return true;
    } else {
      // Turn off completely if we were triggered, but are now invalid.
      this.triggered(false);
      return false;
    }
  });

  closeDistractingTabs() {
    this.triggered(false);
    var tabsToRemove = this.badBehaviourMonitor.currentBadTabs();
    chrome.tabs.remove(tabsToRemove.map((t) => t.id), () => reportChromeErrors);
    closeCurrentTab();
  }

  leaveDistractingTabs() {
    this.triggered(false);
  }
}

export = BadTabsWarningViewModel;
