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

    var rawBackgroundImage = new Image();
    rawBackgroundImage.src = "/images/icon-19.png";
    rawBackgroundImage.onload = function () {
      badgeBackground(rawBackgroundImage);
    };

    var badgeBackground = ko.observable();

    function drawOutline(context, color, length, width) {
      context.beginPath();

      context.strokeStyle = color;
      context.setLineDash([length, 1000]);
      context.lineWidth = width;

      context.moveTo(0, 0);
      context.lineTo(19, 0);
      context.lineTo(19, 19);
      context.lineTo(0, 19);
      context.lineTo(0, 0);

      context.stroke();
    }

    var badgeIcon = ko.computed(function () {
      var canvas = document.createElement('canvas');
      canvas.setAttribute("style", "width: 19px; height: 19px");

      var context = canvas.getContext('2d');
      if (badgeBackground()) {
        context.drawImage(badgeBackground(), 0, 0, 19, 19);
      }

      if (progressObservable() !== null) {
        var fullDistance = 19*4;
        var progressDistance = progressObservable() * (fullDistance / 100);

        context.globalCompositeOperation = "destination-out";
        drawOutline(context, "#000", fullDistance, 5);
        context.globalCompositeOperation = "source-over";
        drawOutline(context, "#f00", progressDistance, 3);
      }

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