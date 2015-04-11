'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "current-urls", "timer"],
  function (ko, _, settings, currentUrls, Timer) {
    var timer = new Timer();

    var onBadDomain = ko.computed(function () {
      return _.any(currentUrls(), function (url) {
        return _.any(settings.badDomains(), function (domain) {
          return domain.matches(url);
        });
      });
    });

    function updateIcon() {
      var text;
      if (onBadDomain()) {
        text = "!!!!";
      } else if (timer.isRunning()) {
        text = "...";
      } else {
        text = "";
      }
      chrome.browserAction.setBadgeText({"text": text});
    }

    chrome.browserAction.onClicked.addListener(function () {
      timer.start(1000 * 60 * 20);
    });

    timer.isRunning.subscribe(updateIcon);
    onBadDomain.subscribe(updateIcon);

    onBadDomain.subscribe(function () {
      if (onBadDomain()) {
        timer.reset();
      }
    });
  }
);