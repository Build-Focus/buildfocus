'use strict';

(function () {
  var currentUrls = ko.observableArray();
  var badDomains = ko.observableArray();

  var onBadDomain = ko.computed(function () {
    return _.any(currentUrls(), function (url) {
      return _.any(badDomains(), function (domain) {
        return domain.matches(url);
      });
    });
  });

  chrome.storage.sync.get("badDomainPatterns", function(storedData) {
    updateBadDomains(storedData.badDomainPatterns || []);
  });

  chrome.storage.onChanged.addListener(function (changes) {
    updateBadDomains(changes.badDomainPatterns.newValue);
  });

  function updateBadDomains(badDomainPatterns) {
    badDomains(_.map(badDomainPatterns, function (pattern) {
      return new Domain(pattern);
    }));
  }

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
}());