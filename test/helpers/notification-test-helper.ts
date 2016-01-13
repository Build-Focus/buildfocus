import SinonFakeTimers = Sinon.SinonFakeTimers;
var chromeStub = <typeof SinonChrome> <any> window.chrome;

const RESULT_NOTIFICATION_ID = "buildfocus-result-notification";
const ACTION_NOTIFICATION_ID = "buildfocus-action-notification";

class NotificationHelper {
  constructor(private clockStub: () => SinonFakeTimers) { }

  // Notification body click helpers
  clickViewCity() {
    chromeStub.notifications.onClicked.trigger(RESULT_NOTIFICATION_ID);
    this.clockStub().tick(0);
  }

  clickStartPomodoro() {
    chromeStub.notifications.onClicked.trigger(ACTION_NOTIFICATION_ID);
    this.clockStub().tick(0);
  }

  clickUnrelatedNotification() {
    chromeStub.notifications.onClicked.trigger("unrelated-notification-id");
    this.clockStub().tick(0);
  }


  // Notification button click helpers
  clickTakeABreak() {
    chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 0);
    this.clockStub().tick(0);
  }

  clickNotNow() {
    chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 1);
    this.clockStub().tick(0);
  }

  clickNonExistantButtonOnActionNotification() {
    chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 2);
    this.clockStub().tick(0);
  }

  clickUnrelatedNotificationButton() {
    chromeStub.notifications.onButtonClicked.trigger("unrelated-notification-id", 0);
    this.clockStub().tick(0);
  }


  // Notification closing helpers
  closeResultNotification(notificationName?:string) {
    chromeStub.notifications.onClosed.trigger(notificationName || RESULT_NOTIFICATION_ID, true);
    this.clockStub().tick(0);
  }

  closeActionsNotification(notificationName?:string) {
    chromeStub.notifications.onClosed.trigger(notificationName || ACTION_NOTIFICATION_ID, true);
    this.clockStub().tick(0);
  }


  // Notification creation spy helpers
  spyForNotificationCreation() {
    this.clockStub().tick(0);
    return chromeStub.notifications.create;
  }

  spyForNotificationClearing() {
    this.clockStub().tick(0);
    return chromeStub.notifications.clear;
  }

  spyForActionNotificationCreation() {
    this.clockStub().tick(0);
    return chromeStub.notifications.create.withArgs(ACTION_NOTIFICATION_ID);
  }

  spyForResultNotificationCreation() {
    this.clockStub().tick(0);
    return chromeStub.notifications.create.withArgs(RESULT_NOTIFICATION_ID);
  }
}
export = NotificationHelper;