'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "current-urls"],
  function (ko, _, settings, currentUrls) {
    var onBadDomain = ko.computed(function () {
      return _.any(currentUrls(), function (url) {
        return _.any(settings.badDomains(), function (domain) {
          return domain.matches(url);
        });
      });
    });

    onBadDomain.subscribe(function (onBadDomain) {
      if (onBadDomain) {
        chrome.browserAction.setBadgeText({"text": "!!!!"});
      } else {
        chrome.browserAction.setBadgeText({"text": ""});
      }
    });
  }
);