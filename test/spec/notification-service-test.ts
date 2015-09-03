'use strict';

import NotificationService = require("app/scripts/notification-service");

var notifications;

var onClickCallback;
var onBreakCallback;

var clockStub;
var chromeStub = <typeof SinonChrome> <any> window.chrome;

var NOTIFICATION_NAME = "pomodoro-notification";

function clickNotification(notificationName?: string) {
  chromeStub.notifications.onClicked.trigger(notificationName || NOTIFICATION_NAME);
}

function clickTakeABreak(notificationName?: string) {
  chromeStub.notifications.onButtonClicked.trigger(notificationName || NOTIFICATION_NAME, 0);
}

function clickMore(notificationName?: string) {
  chromeStub.notifications.onButtonClicked.trigger(notificationName || NOTIFICATION_NAME, 1);
}

function closeNotification(notificationName?: string) {
  chromeStub.notifications.onClosed.trigger(notificationName || NOTIFICATION_NAME, true);
}

describe('Notification service', function () {
  before(function () {
    clockStub = sinon.useFakeTimers();
  });

  after(function () {
    clockStub.restore();
  });

  beforeEach(function () {
    clockStub.reset();
    chromeStub.reset();

    var imageSource = sinon.stub().returns({ imagePath: "building-image" });
    notifications = new NotificationService(imageSource);
    onClickCallback = sinon.stub();
    onBreakCallback = sinon.stub();

    notifications.onClick(onClickCallback);
    notifications.onBreak(onBreakCallback);
  });

  describe("success notifications", () => {
    beforeEach(() => notifications.showSuccessNotification());

    it('should appear', function () {
      expect(chromeStub.notifications.create.calledOnce).to.equal(true);
    });

    it('should show a new building image', function () {
      expect(chromeStub.notifications.create.args[0][1].iconUrl).to.equal("building-image");
    });
  });

  describe("break notifiations", () => {
    beforeEach(() => notifications.showBreakNotification());

    it('should appear', function () {
      expect(chromeStub.notifications.create.calledOnce).to.equal(true);
    });

    it('should show the BF logo', function () {
      expect(chromeStub.notifications.create.args[0][1].iconUrl).to.equal("images/icon-128.png");
    });
  });

  describe("button subscriptions", () => {
    it('should call onClick callbacks when a pomodoro notification is clicked', function () {
      clickNotification();
      expect(onClickCallback.calledOnce).to.equal(true);
    });

    it('should not call onClick callbacks when some other notification is clicked', function () {
      clickNotification("other-notification");
      expect(onClickCallback.called).to.equal(false);
    });

    it('should call onBreak callbacks when a pomodoro break button is clicked', function () {
      clickTakeABreak();
      expect(onBreakCallback.calledOnce).to.equal(true);
    });

    it('should not call onBreak callbacks when a button on some other notification is clicked', function () {
      clickTakeABreak("other-notification");
      expect(onBreakCallback.calledOnce).to.equal(false);
    });
  });

  describe("notification dismissal", function () {
    it("should clear the notification initially when a new notification arrives", function () {
      notifications.showSuccessNotification();
      expect(chromeStub.notifications.clear.calledOnce).to.equal(true);
    });

    it("should cancel a notification after it's clicked", function () {
      notifications.showSuccessNotification();

      clickNotification();
      expect(chromeStub.notifications.clear.calledTwice).to.equal(true);
    });

    it("should cancel a notification after the break button is clicked", function () {
      notifications.showSuccessNotification();

      clickTakeABreak();
      expect(chromeStub.notifications.clear.calledTwice).to.equal(true);
    });

    it("should cancel a notification if the not now button is clicked", function () {
      notifications.showSuccessNotification();

      clickMore();
      expect(chromeStub.notifications.clear.calledTwice).to.equal(true);
    });
  });

  describe("notification persistence", function () {
    function shouldReissueNotificationOnlyIfUntouched(name, showNotification) {
      describe(`of ${name} notifications`, () => {
        beforeEach(showNotification);

        it(`should cancel and reissue ${name} notifications that aren't touched within 8 seconds`, function () {
          clockStub.tick(8000);
          expect(chromeStub.notifications.create.callCount).to.equal(2);
        });

        it(`should not reissue ${name} notifications if they're clicked within 8 seconds`, function () {
          clickNotification();
          clockStub.tick(8000);
          expect(chromeStub.notifications.create.callCount).to.equal(1);
        });

        it(`should not reissue ${name} notifications if they're closed within 8 seconds`, function () {
          closeNotification();
          clockStub.tick(8000);
          expect(chromeStub.notifications.create.callCount).to.equal(1);
        });

        it(`should reissue ${name} notifications if they're closed by the reissue itself`, function () {
          clockStub.tick(8000);
          chromeStub.notifications.onClosed.trigger(NOTIFICATION_NAME, false);

          expect(chromeStub.notifications.create.callCount).to.equal(2);
        });
      });
    }

    shouldReissueNotificationOnlyIfUntouched("success", () => notifications.showSuccessNotification());
    shouldReissueNotificationOnlyIfUntouched("break", () => notifications.showBreakNotification());
  });
});