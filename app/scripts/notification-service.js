'use strict';

define(["lodash", "subscribable-event"], function (_, SubscribableEvent) {
  var notificationId = "rivet-pomodoro-notification";
  var notificationReissueTimeoutId = null;

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
    var self = this;

    self.showSuccessNotification = function () {
      var notification = buildNotification(
        "Success! Go again?",
        "Click to start a new Pomodoro",
        [{"title": "Take a break"}, {"title": "More..."}]
      );

      self.clearNotifications();
      chrome.notifications.create(notificationId, notification, function () {});
      notificationReissueTimeoutId = setTimeout(self.showSuccessNotification, 7500);
    };

    self.showBreakNotification = function () {
      var notification = buildNotification(
        "Break time's over",
        "Click to start a new Pomodoro",
        [{"title": "Just one more break"}, {"title": "More..."}]
      );

      self.clearNotifications();
      chrome.notifications.create(notificationId, notification, function () {});
      notificationReissueTimeoutId = setTimeout(self.showBreakNotification, 7500);
    };

    self.clearNotifications = function () {
      clearTimeout(notificationReissueTimeoutId);
      chrome.notifications.clear(notificationId, function () { });
    };

    self.onClick = new SubscribableEvent();

    chrome.notifications.onClicked.addListener(function (clickedNotificationId) {
      if (clickedNotificationId === notificationId) {
        self.clearNotifications();
        self.onClick.trigger();
      }
    });

    self.onBreak = new SubscribableEvent();
    self.onMore = new SubscribableEvent();

    chrome.notifications.onButtonClicked.addListener(function (clickedNotificationId, buttonIndex) {
      if (clickedNotificationId === notificationId) {
        self.clearNotifications();
        if (buttonIndex === 0) {
          self.onBreak.trigger();
        } else if (buttonIndex === 1) {
          self.onMore.trigger();
        }
      }
    });
  };
});