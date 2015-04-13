'use strict';

define(["lodash", "knockout"], function (_, ko) {
  return function FocusButton(pointsObservable, statusObservable) {
    var onClickCallbacks = [];

    chrome.browserAction.onClicked.addListener(function () {
      _.forEach(onClickCallbacks, function (callback) {
        callback();
      });
    });

    this.onClick = function (callback) {
      onClickCallbacks.push(callback);
    };

    var badgeText = ko.computed(function () {
      var points = pointsObservable().toString();
      if (statusObservable()) {
        return "..." + points;
      } else {
        return points;
      }
    });

    var badgeColor = ko.computed(function () {
      return statusObservable() ? "#0F0" : "#F00";
    });

    function updateBadgeText() {
      chrome.browserAction.setBadgeText({"text": badgeText()});
    }

    function updateBadgeColor() {
      chrome.browserAction.setBadgeBackgroundColor({"color": badgeColor()});
    }

    badgeText.subscribe(updateBadgeText);
    updateBadgeText();
    badgeColor.subscribe(updateBadgeColor);
    updateBadgeColor();
  };
});