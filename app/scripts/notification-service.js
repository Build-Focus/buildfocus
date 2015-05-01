'use strict';

define(["lodash"], function (_) {
  var successNotificationId = "pomodoro-success";

  return function NotificationService() {
    this.showSuccessNotification = function () {
      chrome.notifications.clear(successNotificationId, function () { });
      chrome.notifications.create(successNotificationId, {
        "type": "basic",
        "title": "Success! Go again?",
        "message": "Click to start a new Pomodoro",
        // Solid green block image:
        "iconUrl": "data:image/gif;base64,R0lGODlhAQABAPAAAADdAP///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==",
        "buttons": [{"title": "Take a break"}],
        "isClickable": true
      }, function () {});
    };

    var onClickCallbacks = [];

    this.onClick = function (callback) {
      onClickCallbacks.push(callback);
    };

    chrome.notifications.onClicked.addListener(function (notificationId) {
      if (notificationId === successNotificationId) {
        _.forEach(onClickCallbacks, function (callback) { callback(); });
      }
    });

    var onBreakCallbacks = [];

    this.onBreak = function (callback) {
      onBreakCallbacks.push(callback);
    };

    chrome.notifications.onButtonClicked.addListener(function (notificationId, buttonIndex) {
      if (notificationId === successNotificationId) {
        if (buttonIndex === 0) {
          _.forEach(onBreakCallbacks, function (callback) { callback(); });
        }
      }
    });
  };
});