'use strict';

import _ = require('lodash');
import SubscribableEvent = require('subscribable-event');

const NOTIFICATION_ID = "rivet-pomodoro-notification";

class NotificationService {
  private notificationReissueTimeoutId: number;

  private onClick = SubscribableEvent();
  private onBreak = SubscribableEvent();
  private onMore = SubscribableEvent();

  constructor() {
    chrome.notifications.onClicked.addListener((clickedNotificationId) => {
      if (clickedNotificationId === NOTIFICATION_ID) {
        this.clearNotifications();
        this.onClick.trigger();
      }
    });

    chrome.notifications.onButtonClicked.addListener((clickedNotificationId, buttonIndex) => {
      if (clickedNotificationId === NOTIFICATION_ID) {
        this.clearNotifications();
        if (buttonIndex === 0) {
          this.onBreak.trigger();
        } else if (buttonIndex === 1) {
          this.onMore.trigger();
        }
      }
    });

    chrome.notifications.onClosed.addListener((closedNotificationid, byUser) => {
      if (closedNotificationid === NOTIFICATION_ID && byUser) {
        this.clearNotifications();
      }
    });
  }

  public showSuccessNotification = () => {
    var notification = this.buildNotification(
      "Success! Go again?",
      "Click to start a new Pomodoro",
      [{"title": "Take a break"}, {"title": "More..."}]
    );

    this.clearNotifications();
    chrome.notifications.create(NOTIFICATION_ID, notification, function () { });
    this.notificationReissueTimeoutId = setTimeout(this.showSuccessNotification.bind(this), 7500);
  }

  public showBreakNotification = () => {
    var notification = this.buildNotification(
      "Break time's over",
      "Click to start a new Pomodoro",
      [{"title": "Just one more break"}, {"title": "More..."}]
    );

    this.clearNotifications();
    chrome.notifications.create(NOTIFICATION_ID, notification, function () { });
    this.notificationReissueTimeoutId = setTimeout(this.showBreakNotification.bind(this), 7500);
  }

  public clearNotifications = () => {
    clearTimeout(this.notificationReissueTimeoutId);
    chrome.notifications.clear(NOTIFICATION_ID, function () { });
  }

  private buildNotification = (title: string, message: string, buttons: Array<any>) => {
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
};

export = NotificationService;