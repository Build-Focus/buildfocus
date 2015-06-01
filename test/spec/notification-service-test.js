/* global describe, it */

(function () {
  'use strict';

  var NotificationService;
  var notifications;

  var onClickCallback;
  var onBreakCallback;

  var clockStub;

  function clickNotification(notificationName) {
    chrome.notifications.onClicked.trigger(notificationName || "rivet-pomodoro-notification");
  }

  function clickTakeABreak(notificationName) {
    chrome.notifications.onButtonClicked.trigger(notificationName || "rivet-pomodoro-notification", 0);
  }

  function clickMore(notificationName) {
    chrome.notifications.onButtonClicked.trigger(notificationName || "rivet-pomodoro-notification", 1);
  }

  function closeNotification(notificationName) {
    chrome.notifications.onClosed.trigger(notificationName || "rivet-pomodoro-notification");
  }

  describe('Notification service', function () {
    before(function (done) {
      require(["notification-service"], function (loadedClass) {
        NotificationService = loadedClass;
        clockStub = sinon.useFakeTimers();
        done();
      });
    });

    after(function () {
      clockStub.restore();
    });

    beforeEach(function () {
      clockStub.timers = {};

      chrome.notifications.clear.reset();
      chrome.notifications.create.reset();
      chrome.notifications.onClicked.removeListeners();
      chrome.notifications.onButtonClicked.removeListeners();

      notifications = new NotificationService();
      onClickCallback = sinon.stub();
      onBreakCallback = sinon.stub();

      notifications.onClick(onClickCallback);
      notifications.onBreak(onBreakCallback);
    });

    it('should create success notification', function () {
      notifications.showSuccessNotification();

      expect(chrome.notifications.create.calledOnce).to.equal(true);
    });

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

    describe("notification dismissal", function () {
      it("should clear the notification initially when a new notification arrives", function () {
        notifications.showSuccessNotification();
        expect(chrome.notifications.clear.calledOnce).to.equal(true);
      });

      it("should cancel a notification after it's clicked", function () {
        notifications.showSuccessNotification();

        clickNotification();
        expect(chrome.notifications.clear.calledTwice).to.equal(true);
      });

      it("should cancel a notification after the break button is clicked", function () {
        notifications.showSuccessNotification();

        clickTakeABreak();
        expect(chrome.notifications.clear.calledTwice).to.equal(true);
      });

      it("should cancel a notification if the not now button is clicked", function () {
        notifications.showSuccessNotification();

        clickMore();
        expect(chrome.notifications.clear.calledTwice).to.equal(true);
      });
    });

    describe("notification persistence", function () {
      function shouldReissueNotificationOnlyIfUntouched(name, showNotification) {
        it("should cancel and reissue " + name + " notifications that aren't touched within 8 seconds", function () {
          showNotification();

          clockStub.tick(8000);
          expect(chrome.notifications.create.callCount).to.equal(2);
        });

        it("should not reissue " + name + " notifications if they're clicked within 8 seconds", function () {
          showNotification();

          clickNotification();
          clockStub.tick(8000);
          expect(chrome.notifications.create.callCount).to.equal(1);
        });

        it("should not reissue " + name + " notifications if they're closed within 8 seconds", function () {
          showNotification();

          closeNotification();
          clockStub.tick(8000);
          expect(chrome.notifications.create.callCount).to.equal(1);
        });
      }

      shouldReissueNotificationOnlyIfUntouched("success", function () {
        notifications.showSuccessNotification();
      });

      shouldReissueNotificationOnlyIfUntouched("break", function () {
        notifications.showBreakNotification();
      });
    });
  });
}());