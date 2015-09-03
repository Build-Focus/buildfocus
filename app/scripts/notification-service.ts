'use strict';

import _ = require('lodash');
import SubscribableEvent = require('subscribable-event');
import reportChromeErrors = require('report-chrome-errors');

import Buildings = require('city/buildings/buildings');

const NOTIFICATION_ID = "pomodoro-notification";

interface ImageConfigSource {
  (building: Buildings.Building): { imagePath: string }
}

class NotificationService {
  private notificationReissueTimeoutId: number;

  public onClick = SubscribableEvent();
  public onBreak = SubscribableEvent();
  public onMore = SubscribableEvent();

  constructor(private getBuildingConfig: ImageConfigSource) {
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

  public showSuccessNotification = (building: Buildings.Building) => {
    var buildingConfig = this.getBuildingConfig(building);

    var notification = this.buildNotification(
      "Success! Go again?",
      "Click to start a new Pomodoro",
      [{"title": "Take a break"}, {"title": "More..."}],
      buildingConfig ? buildingConfig.imagePath : undefined
    );

    this.clearNotifications();
    chrome.notifications.create(NOTIFICATION_ID, notification, () => reportChromeErrors());
    this.notificationReissueTimeoutId = setTimeout(() => this.showSuccessNotification(building), 7500);
  };

  public showBreakNotification = () => {
    var notification = this.buildNotification(
      "Break time's over",
      "Click to start a new Pomodoro",
      [{"title": "Just one more break"}, {"title": "More..."}]
    );

    this.clearNotifications();
    chrome.notifications.create(NOTIFICATION_ID, notification, () => reportChromeErrors());
    this.notificationReissueTimeoutId = setTimeout(this.showBreakNotification.bind(this), 7500);
  };

  public clearNotifications = () => {
    clearTimeout(this.notificationReissueTimeoutId);
    chrome.notifications.clear(NOTIFICATION_ID, () => reportChromeErrors());
  };

  private buildNotification = (title: string, message: string, buttons: Array<any>,
                               imageUrl: string = "images/icon-128.png") => {
    return {
      "type": "basic",
      "title": title,
      "message": message,
      "iconUrl": imageUrl,
      "buttons": buttons,
      "isClickable": true
    };
  }
};

export = NotificationService;