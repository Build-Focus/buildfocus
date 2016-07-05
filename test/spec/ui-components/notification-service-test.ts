'use strict';

import NotificationService = require("app/scripts/ui-components/notification-service");
import NotificationHelper = require("test/helpers/notification-test-helper");
import Buildings = require("app/scripts/city/buildings/buildings");

var notifications: NotificationService;

var onStartCallback;
var onBreakCallback;
var onShowResultCallback;
var onRejectResultCallback;

var clockStub: Sinon.SinonFakeTimers;
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

    var getImageConfig = sinon.stub().returns({ imagePath: "building-image" });
    notifications = new NotificationService({ getBuildingConfig: getImageConfig });

    onStartCallback = sinon.stub();
    onBreakCallback = sinon.stub();
    onShowResultCallback = sinon.stub();
    onRejectResultCallback = sinon.stub();

    notifications.onPomodoroStart(onStartCallback);
    notifications.onBreak(onBreakCallback);
    notifications.onShowResult(onShowResultCallback);
    notifications.onRejectResult(onRejectResultCallback);
  });

  describe("success notifications", () => {
    beforeEach(() => notifications.showSuccessNotification(<Buildings.Building> {}));

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

  describe("when I Got Distracted is clicked", () => {
    var building = <Buildings.Building> { };
    beforeEach(() => {
      notifications.showSuccessNotification(building);
      notificationHelper.clickIGotDistracted()
    });

    it("should not immediately call the reject result callback", () => {
      expect(onRejectResultCallback.called).to.equal(false);
    });

    it("should show a confirmation notification", () => {
      expect(notificationHelper.spyForConfirmDistractedNotificationCreation().callCount).to.equal(1);
    });

    describe("and the confirmation notification is clicked", () => {
      beforeEach(() => notificationHelper.clickConfirmIGotDistracted());

      it("should call the reject result callback with the rejected result", () => {
        expect(onRejectResultCallback.called).to.equal(true);
        expect(onRejectResultCallback.calledWith(building)).to.equal(true);
      });
    });

    describe("and the confirmation notification is cancelled", () => {
      beforeEach(() => notificationHelper.cancelConfirmIGotDistracted());

      it("should retrigger the initial notifications", () => {
        expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(2);
        expect(notificationHelper.spyForResultNotificationCreation().callCount).to.equal(2);
      });
    });
  });

  describe("notification dismissal", function () {
    it("should clear all notifications initially when a new notification arrives", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });

    it("should cancel all notifications after a pomodoro is started", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      chromeStub.notifications.clear.reset();

      notificationHelper.clickStartPomodoro();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });

    it("should cancel all notifications after a break is started", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      chromeStub.notifications.clear.reset();

      notificationHelper.clickTakeABreak();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });

    it("should cancel all notifications after a not now is clicked", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      chromeStub.notifications.clear.reset();

      notificationHelper.clickNotNow();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });

    it("should cancel all notifications after the city is viewed", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      chromeStub.notifications.clear.reset();

      notificationHelper.clickViewCity();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });

    it("should cancel all notifications when initially rejecting a result", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      notificationHelper.spyForNotificationClearing().reset();

      notificationHelper.clickIGotDistracted();
      // All cleared when clicking the button, and again when spawning the new notification
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(6);
    });

    it("should cancel all notifications when confirming rejection of a result", function () {
      notifications.showSuccessNotification(<Buildings.Building> {});
      chromeStub.notifications.clear.reset();

      notificationHelper.clickConfirmIGotDistracted();
      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(3);
    });
  });

  describe("notification persistence", function () {
    function waitForReissue() {
      clockStub.tick(8000);
    }

    function shouldReissueNotificationOnlyIfUntouched(name, showNotification) {
      describe(`of ${name} notifications`, () => {
        beforeEach(() => {
          showNotification();
          notificationHelper.spyForNotificationCreation().reset();
        });

        it(`should cancel and reissue ${name} notifications that aren't touched within 8 seconds`, function () {
          waitForReissue();
          expect(notificationHelper.spyForNotificationCreation().called).to.equal(true);
        });

        it(`should not reissue ${name} notifications if they're clicked within 8 seconds`, function () {
          notificationHelper.clickStartPomodoro();
          waitForReissue();
          expect(notificationHelper.spyForNotificationCreation().called).to.equal(false);
        });

        it(`should not reissue ${name} notifications if they're closed within 8 seconds`, function () {
          notificationHelper.closeActionsNotification();
          waitForReissue();
          expect(notificationHelper.spyForNotificationCreation().called).to.equal(false);
        });

        it(`should not reissue ${name} notifications if they're closed by the user`, function () {
          waitForReissue();
          notificationHelper.spyForNotificationCreation().reset();

          notificationHelper.closeResultNotification();

          expect(notificationHelper.spyForNotificationCreation().called).to.equal(false);
        });
      });
    }

    shouldReissueNotificationOnlyIfUntouched("success", () => notifications.showSuccessNotification(<Buildings.Building> {}));
    shouldReissueNotificationOnlyIfUntouched("break", () => notifications.showBreakNotification());
    shouldReissueNotificationOnlyIfUntouched("rejection confirmation", () => {
      notificationHelper.clickIGotDistracted();
    });
  });
});
