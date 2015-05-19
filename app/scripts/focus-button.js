'use strict';

define(["lodash", "knockout"], function (_, ko) {
  return function FocusButton(pointsObservable, statusObservable, progressObservable) {
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

    var badgeIcon = ko.computed(function () {
      var canvas = document.createElement('canvas');
      var context = canvas.getContext('2d');

      context.beginPath();

      context.setLineDash([progressObservable(), 19*4 + 1]);
      context.lineWidth = 3;

      context.moveTo(0, 0);
      context.lineTo(19, 0);
      context.lineTo(19, 19);
      context.lineTo(0, 19);
      context.lineTo(0, 0);

      context.stroke();

      return context.getImageData(0, 0, 19, 19);
    });

    function updateBadgeText(badgeText) {
      chrome.browserAction.setBadgeText({"text": badgeText});
    }

    function updateBadgeColor(badgeColor) {
      chrome.browserAction.setBadgeBackgroundColor({"color": badgeColor});
    }

    function updateBadgeIcon(imageData) {
      chrome.browserAction.setIcon({
        imageData: imageData
      });
    }

    badgeText.subscribe(updateBadgeText);
    updateBadgeText(badgeText());

    badgeColor.subscribe(updateBadgeColor);
    updateBadgeColor(badgeColor());

    badgeIcon.subscribe(updateBadgeIcon);
    updateBadgeIcon(badgeIcon());
  };
});