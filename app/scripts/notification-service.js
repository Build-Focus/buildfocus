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
        "buttons": [],
        // TODO: "buttons": [{"title": "Take a break"}, {"title": "Not now"}],
        "isClickable": true
      }, function () {});
    };

    var onClickCallbacks = [];

    this.onClick = function (callback) {
      onClickCallbacks.push(callback);
    };

    chrome.notifications.onClicked.addListener(function (notificationId) {
      if (notificationId === successNotificationId) {
        _.forEach(onClickCallbacks, function (callback) {
          callback();
        });
      }
    });
  };
});