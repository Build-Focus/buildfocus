var chromeStub = <typeof SinonChrome> <any> window.chrome;

const RESULT_NOTIFICATION_ID = "buildfocus-result-notification";
const ACTION_NOTIFICATION_ID = "buildfocus-action-notification";

// Notification body click helpers
export function clickViewCity() {
  chromeStub.notifications.onClicked.trigger(RESULT_NOTIFICATION_ID);
}

export function clickStartPomodoro() {
  chromeStub.notifications.onClicked.trigger(ACTION_NOTIFICATION_ID);
}

export function clickUnrelatedNotification() {
  chromeStub.notifications.onClicked.trigger("unrelated-notification-id");
}


// Notification button click helpers
export function clickTakeABreak() {
  chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 0);
}

export function clickNotNow() {
  chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 1);
}

export function clickNonExistantButtonOnActionNotification() {
  chromeStub.notifications.onButtonClicked.trigger(ACTION_NOTIFICATION_ID, 2);
}

export function clickUnrelatedNotificationButton() {
  chromeStub.notifications.onButtonClicked.trigger("unrelated-notification-id", 0);
}


// Notification closing helpers
export function closeResultNotification(notificationName?: string) {
  chromeStub.notifications.onClosed.trigger(notificationName || RESULT_NOTIFICATION_ID, true);
}

export function closeActionsNotification(notificationName?: string) {
  chromeStub.notifications.onClosed.trigger(notificationName || ACTION_NOTIFICATION_ID, true);
}


// Notification creation spy helpers
export function spyForNotificationCreation() {
  return chromeStub.notifications.create;
}

export function spyForNotificationClearing() {
  return chromeStub.notifications.clear;
}

export function spyForActionNotificationCreation() {
  return chromeStub.notifications.create.withArgs(ACTION_NOTIFICATION_ID);
}

export function spyForResultNotificationCreation() {
  return chromeStub.notifications.create.withArgs(RESULT_NOTIFICATION_ID);
}