'use strict';

import _ = require('lodash');
import SubscribableEvent = require('subscribable-event');

import reportChromeErrors = require('chrome-utilities/report-chrome-errors');
import tracking = require('tracking/tracking');

import Buildings = require('city/buildings/buildings');

const RESULT_NOTIFICATION_ID = "buildfocus-result-notification";
const ACTIONS_NOTIFICATION_ID = "buildfocus-action-notification";
const CONFIRM_RESULT_REJECTED_NOTIFICATION_ID = "buildfocus-confirm-result-rejected-notification";

interface BuildingImageConfigSource {
  getBuildingConfig(building: Buildings.Building): { imagePath: string }
}

function isOurNotification(notificationId: string): boolean {
  return _.contains([
    ACTIONS_NOTIFICATION_ID,
    RESULT_NOTIFICATION_ID,
    CONFIRM_RESULT_REJECTED_NOTIFICATION_ID
  ], notificationId);
}

// TODO: Think about nice ways to separate out the things this is doing (by notification type?)
class NotificationService {
  private notificationReissueTimeoutId: number;

  public onPomodoroStart = SubscribableEvent();
  public onBreak = SubscribableEvent();

  public onShowResult = SubscribableEvent();
  public onRejectResult = SubscribableEvent<Buildings.Building>();

  private lastResult: Buildings.Building = null;

  constructor(private renderableConfigLoader: BuildingImageConfigSource) {
    chrome.notifications.onClicked.addListener((clickedNotificationId) => {
      if (isOurNotification(clickedNotificationId)) this.clearNotifications();

      if (clickedNotificationId === ACTIONS_NOTIFICATION_ID) {
        tracking.trackEvent("start-from-notification");
        this.onPomodoroStart.trigger();
      }

      else if (clickedNotificationId === RESULT_NOTIFICATION_ID) {
        tracking.trackEvent("open-page-from-notification");
        this.onShowResult.trigger();
      }

      else if (clickedNotificationId === CONFIRM_RESULT_REJECTED_NOTIFICATION_ID) {
        tracking.trackEvent("confirm-result-rejected");
        this.onRejectResult.trigger(this.lastResult);
      }
    });

    chrome.notifications.onButtonClicked.addListener((clickedNotificationId, buttonIndex) => {
      if (isOurNotification(clickedNotificationId)) this.clearNotifications();

      if (clickedNotificationId === ACTIONS_NOTIFICATION_ID) {
        if (buttonIndex === 0) {
          tracking.trackEvent("start-break-from-notification");
          this.onBreak.trigger();
        } else if (buttonIndex === 1) {
          tracking.trackEvent("close-notification-from-not-now");
        }
      } else if (clickedNotificationId === RESULT_NOTIFICATION_ID) {
        if (buttonIndex === 0) {
          tracking.trackEvent("start-reject-result");
          this.confirmResultRejection();
        }
      } else if (clickedNotificationId === CONFIRM_RESULT_REJECTED_NOTIFICATION_ID) {
        if (buttonIndex === 0) {
          tracking.trackEvent("cancel-reject-result");
          this.showSuccessNotification(this.lastResult);
        }
      }
    });

    chrome.notifications.onClosed.addListener((closedNotificationid, byUser) => {
      if (byUser && isOurNotification(closedNotificationid)) {
        this.clearNotifications();
        tracking.trackEvent("close-notification", {id: closedNotificationid});
      }
    });
  }

  public showSuccessNotification = (building: Buildings.Building) => {
    this.lastResult = building;
    var buildingConfig = this.renderableConfigLoader.getBuildingConfig(building);

    var buildingNotification = this.buildNotification(
      "Success! Great work.",
      "Your city's getting bigger and better. Click here to take a look.",
      [{
        title: "Actually, I got distracted.",
        iconUrl: "images/warning.svg"
      }],
      buildingConfig ? buildingConfig.imagePath : undefined
    );

    var continueNotification = this.buildNotification(
      "Go again?",
      "Click here to focus again for another 25 minutes.",
      [{title: "Take a break"}, {"title": "Stop for now"}]
    );

    this.clearNotifications();
    chrome.notifications.create(ACTIONS_NOTIFICATION_ID, continueNotification, () => reportChromeErrors());

    // Push the other one async - this ensures they always appear in the correct order (result above actions)
    setTimeout(() => {
      chrome.notifications.create(RESULT_NOTIFICATION_ID, buildingNotification, () => reportChromeErrors())
    }, 1);

    this.notificationReissueTimeoutId = setTimeout(() => this.showSuccessNotification(building), 7500);
  };

  public showBreakNotification = () => {
    var notification = this.buildNotification(
      "Break time's over",
      "Click here to get some focus for\n25 minutes",
      [{"title": "Just one more break"}, {"title": "Stop for now"}]
    );

    this.clearNotifications();
    chrome.notifications.create(ACTIONS_NOTIFICATION_ID, notification, () => reportChromeErrors());
    this.notificationReissueTimeoutId = setTimeout(this.showBreakNotification.bind(this), 7500);
  };

  private confirmResultRejection = () => {
    var notification = this.buildNotification(
      "Oh no!",
      "Click here to confirm you got distracted.\nThis will replace your last success with a failure.",
      [{"title": "Cancel"}],
      "images/warning.svg"
    );

    this.clearNotifications();
    chrome.notifications.create(CONFIRM_RESULT_REJECTED_NOTIFICATION_ID, notification, () => reportChromeErrors());
    this.notificationReissueTimeoutId = setTimeout(this.confirmResultRejection.bind(this), 7500);
  }

  public clearNotifications = () => {
    clearTimeout(this.notificationReissueTimeoutId);
    chrome.notifications.clear(RESULT_NOTIFICATION_ID, () => reportChromeErrors());
    chrome.notifications.clear(ACTIONS_NOTIFICATION_ID, () => reportChromeErrors());
    chrome.notifications.clear(CONFIRM_RESULT_REJECTED_NOTIFICATION_ID, () => reportChromeErrors());
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
