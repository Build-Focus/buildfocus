'use strict';

define(["knockout", "lodash"], function (ko, _) {
  function buildCurrentUrlsObservable() {
    var currentUrls = ko.observableArray();

    function updateCurrentUrls() {
      chrome.tabs.query({'active': true}, function (activeTabs) {
        currentUrls(_.map(activeTabs, 'url'));
      });
    }

    updateCurrentUrls();
    chrome.tabs.onActivated.addListener(updateCurrentUrls);
    chrome.tabs.onUpdated.addListener(updateCurrentUrls);
    chrome.tabs.onRemoved.addListener(updateCurrentUrls);

    return currentUrls;
  }

  return buildCurrentUrlsObservable();
});