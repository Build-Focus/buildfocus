'use strict';

import ko = require("knockout");
import _ = require("lodash");

class TabsMonitor {
  activeTabs: KnockoutObservableArray<chrome.tabs.Tab> = ko.observableArray([]);
  allTabs: KnockoutObservableArray<chrome.tabs.Tab> = ko.observableArray([]);

  constructor() {
    chrome.tabs.onActivated.addListener(this.updateCurrentTabs);
    chrome.tabs.onUpdated.addListener(this.updateCurrentTabs);
    chrome.tabs.onRemoved.addListener(this.updateCurrentTabs);

    this.updateCurrentTabs();
  }

  updateCurrentTabs = () => {
    chrome.tabs.query({}, (tabs: Array<chrome.tabs.Tab>) => {
      this.allTabs(tabs);
      this.activeTabs(_.where(tabs, {active: true}));
    });
  };
}

export = TabsMonitor;