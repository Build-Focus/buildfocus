'use strict';

import ko = require("knockout");
import _ = require("lodash");

var currentTabs: KnockoutObservableArray<chrome.tabs.Tab> = ko.observableArray([]);

function updateCurrentTabs() {
  chrome.tabs.query({'active': true}, function (activeTabs: Array<chrome.tabs.Tab>) {
    currentTabs(activeTabs);
  });
}

updateCurrentTabs();

chrome.tabs.onActivated.addListener(updateCurrentTabs);
chrome.tabs.onUpdated.addListener(updateCurrentTabs);
chrome.tabs.onRemoved.addListener(updateCurrentTabs);

export = currentTabs;