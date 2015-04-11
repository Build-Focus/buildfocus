'use strict';

require(["knockout", "lodash", "repositories/settings-repository"], function (ko, _, settings) {
  var currentUrls = ko.observableArray();

  var onBadDomain = ko.computed(function () {
    return _.any(currentUrls(), function (url) {
      return _.any(settings.badDomains(), function (domain) {
        return domain.matches(url);
      });
    });
  });

  function updateCurrentUrls() {
    chrome.tabs.query({'active': true}, function (activeTabs) {
      currentUrls(_.map(activeTabs, 'url'));
      console.log(currentUrls()[0]);
    });
  }

  updateCurrentUrls();
  chrome.tabs.onActivated.addListener(updateCurrentUrls);
  chrome.tabs.onUpdated.addListener(updateCurrentUrls);
  chrome.tabs.onRemoved.addListener(updateCurrentUrls);

  onBadDomain.subscribe(function (onBadDomain) {
    if (onBadDomain) {
      chrome.browserAction.setBadgeText({"text": "!!!!"});
    } else {
      chrome.browserAction.setBadgeText({"text": ""});
    }
  });
});