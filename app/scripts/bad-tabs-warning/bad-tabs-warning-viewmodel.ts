import ko = require('raw-knockout');

import ProxyPomodoroService = require("pomodoro/proxy-pomodoro-service");

import reportChromeErrors = require('chrome-utilities/report-chrome-errors');
import tracking = require('tracking/tracking');

import BadTabsWarningAction = require('bad-tabs-warning/bad-tabs-warning-action');
import ProxyBadTabsWarningService = require('bad-tabs-warning/proxy-bad-tabs-warning-service');

class BadTabsWarningViewModel {
  rememberInFuture = ko.observable(false);

  constructor(private badTabsWarningService: ProxyBadTabsWarningService) { }

  isShowing = this.badTabsWarningService.isWarningActive;

  closeDistractingTabs() {
    chrome.runtime.sendMessage({action: "bad-tabs.close", remember: this.rememberInFuture()});

    tracking.trackEvent("tabs-warning.close-tabs", {
      remember: this.rememberInFuture()
    });
  }

  leaveDistractingTabs() {
    chrome.runtime.sendMessage({action: "bad-tabs.leave", remember: this.rememberInFuture()});

    tracking.trackEvent("tabs-warning.leave-tabs", {
      remember: this.rememberInFuture()
    });
  }

}

export = BadTabsWarningViewModel;
