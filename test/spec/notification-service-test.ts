import SinonFakeTimers = Sinon.SinonFakeTimers;
'use strict';

import NotificationService = require("app/scripts/notification-service");
import NotificationHelper = require("test/helpers/notification-test-helper");

var notifications;

var onStartCallback;
var onBreakCallback;
var onShowResultCallback;

var clockStub: SinonFakeTimers;
var notificationHelper = new NotificationHelper(() => clockStub);
var chromeStub = <typeof SinonChrome> <any> window.chrome;

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

    onStartCallback = sinon.stub();
    onBreakCallback = sinon.stub();
    onShowResultCallback = sinon.stub();

    notifications.onPomodoroStart(onStartCallback);
    notifications.onBreak(onBreakCallback);
    notifications.onShowResult(onShowResultCallback);
  });

  describe("success notifications", () => {
    beforeEach(() => notifications.showSuccessNotification());

    it('should show the success result', function () {
      expect(notificationHelper.spyForResultNotificationCreation().callCount).to.equal(1);
    });

    it('should show the success actions', function () {
      expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(1);
    });

    it('should show a new building image on the result', function () {
      expect(notificationHelper.spyForResultNotificationCreation().args[0][1].iconUrl).to.equal("building-image");
    });
  });

  describe("break notifications", () => {
    beforeEach(() => notifications.showBreakNotification());

    it('should show only one notification', () => {
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(1)
    });

    it('should show the BF logo', function () {
      expect(notificationHelper.spyForNotificationCreation().args[0][1].iconUrl).to.equal("images/icon-128.png");
    });
  });

  describe("button subscriptions", () => {
    it('should call onClick callbacks when a pomodoro is started', function () {
      notificationHelper.clickStartPomodoro();
      expect(onStartCallback.calledOnce).to.equal(true);
    });

    it('should call onBreak callbacks when a pomodoro break button is clicked', function () {
      notificationHelper.clickTakeABreak();
      expect(onBreakCallback.calledOnce).to.equal(true);
    });

    it('should call onShowResult callbacks when the view city button is clicked', function () {
      notificationHelper.clickViewCity();
      expect(onShowResultCallback.calledOnce).to.equal(true);
    });

    it('should not call onClick callbacks when some other notification is clicked', function () {
      notificationHelper.clickUnrelatedNotification();
      expect(onStartCallback.called).to.equal(false);
    });

    it('should not call onBreak callbacks when a button on some other notification is clicked', function () {
      notificationHelper.clickUnrelatedNotificationButton();
      expect(onBreakCallback.called).to.equal(false);
    });

    it('should call no callbacks when the now not button is pressed', function () {
      notificationHelper.clickNotNow();

      expect(onStartCallback.called).to.equal(false);
      expect(onBreakCallback.called).to.equal(false);
      expect(onShowResultCallback.called).to.equal(false);
    });
  });

  describe("notification dismissal", function () {
    it("should clear both notifications initially when a new notification arrives", function () {
      notifications.showSuccessNotification();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should cancel both notifications after a pomodoro is started", function () {
      notifications.showSuccessNotification();
      chromeStub.notifications.clear.reset();

      notificationHelper.clickStartPomodoro();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should cancel both notifications after a break is started", function () {
      notifications.showSuccessNotification();
      chromeStub.notifications.clear.reset();

      notificationHelper.clickTakeABreak();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should cancel both notifications after a not now is clicked", function () {
      notifications.showSuccessNotification();
      chromeStub.notifications.clear.reset();

      notificationHelper.clickNotNow();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should cancel both notifications after the city is viewed", function () {
      notifications.showSuccessNotification();
      chromeStub.notifications.clear.reset();

      notificationHelper.clickViewCity();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });
  });

  describe("notification persistence", function () {
    function shouldReissueNotificationOnlyIfUntouched(name, showNotification) {
      describe(`of ${name} notifications`, () => {
        beforeEach(showNotification);

        it(`should cancel and reissue ${name} notifications that aren't touched within 8 seconds`, function () {
          clockStub.tick(8000);
          expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(2);
        });

        it(`should not reissue ${name} notifications if they're clicked within 8 seconds`, function () {
          notificationHelper.clickStartPomodoro();
          clockStub.tick(8000);
          expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(1);
        });

        it(`should not reissue ${name} notifications if they're closed within 8 seconds`, function () {
          notificationHelper.closeActionsNotification();
          clockStub.tick(8000);
          expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(1);
        });

        it(`should reissue ${name} notifications if they're closed by the reissue itself`, function () {
          clockStub.tick(8000);
          notificationHelper.closeResultNotification();

          expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(2);
        });
      });
    }

    shouldReissueNotificationOnlyIfUntouched("success", () => notifications.showSuccessNotification());
    shouldReissueNotificationOnlyIfUntouched("break", () => notifications.showBreakNotification());
  });
});