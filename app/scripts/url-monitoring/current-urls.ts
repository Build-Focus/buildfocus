'use strict';

import ko = require("knockout");
import _ = require("lodash");

var currentUrls: KnockoutObservableArray<string> = ko.observableArray([]);

function updateCurrentUrls() {
  chrome.tabs.query({'active': true}, function (activeTabs: Array<chrome.tabs.Tab>) {
    var urls = _.map(activeTabs, (tab) => tab.url);
    currentUrls(urls);
  });
}

updateCurrentUrls();

chrome.tabs.onActivated.addListener(updateCurrentUrls);
chrome.tabs.onUpdated.addListener(updateCurrentUrls);
chrome.tabs.onRemoved.addListener(updateCurrentUrls);

export = currentUrls;