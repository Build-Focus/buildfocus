'use strict';

define(["lodash"], function (_) {
  var notificationId = "rivet-pomodoro-notification";

  function buildNotification(title, message, buttons) {
    return {
      "type": "basic",
      "title": title,
      "message": message,
      // Solid green block image:
      "iconUrl": "data:image/gif;base64,R0lGODlhAQABAPAAAADdAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
      "buttons": buttons,
      "isClickable": true
    };
  }

  return function NotificationService() {
    this.showSuccessNotification = function () {
      var notification = buildNotification(
        "Success! Go again?",
        "Click to start a new Pomodoro",
        [{"title": "Take a break"}, {"title": "Not now"}]
      );

      chrome.notifications.clear(notificationId, function () { });
      chrome.notifications.create(notificationId, notification, function () {});
    };

    this.showBreakNotification = function () {
      var notification = buildNotification(
        "Break time's over",
        "Click to start a new Pomodoro",
        [{"title": "Just one more break"}, {"title": "Not now"}]
      );

      chrome.notifications.clear(notificationId, function () { });
      chrome.notifications.create(notificationId, notification, function () {});
    };

    var onClickCallbacks = [];

    this.onClick = function (callback) {
      onClickCallbacks.push(callback);
    };

    chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
      if (clickedNotificationId === notificationId) {
        _.forEach(onClickCallbacks, function (callback) { callback(); });
      }
    });

    var onBreakCallbacks = [];

    this.onBreak = function (callback) {
      onBreakCallbacks.push(callback);
    };

    chrome.notifications.onButtonClicked.addListener(function (clickedNotificationId, buttonIndex) {
      if (clickedNotificationId === notificationId) {
        if (buttonIndex === 0) {
          _.forEach(onBreakCallbacks, function (callback) { callback(); });
        }
      }
    });
  };
});