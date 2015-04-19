'use strict';

define(function () {
  return function NotificationService() {
    this.showSuccessNotification = function () {
      chrome.notifications.clear("pomodoro-success", function () { });
      chrome.notifications.create("pomodoro-success", {
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
  };
});