/* global describe, it */

(function () {
  'use strict';

  var NotificationService;
  var notifications;

  var onClickCallback;
  var onBreakCallback;

  describe('Notification service', function () {
    before(function (done) {
      require(["notification-service"], function (loadedClass) {
        NotificationService = loadedClass;
        done();
      });
    });

    beforeEach(function () {
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
      chrome.notifications.onClicked.trigger("pomodoro-success");
      expect(onClickCallback.calledOnce).to.equal(true);
    });

    it('should not call onClick callbacks when some other notification is clicked', function () {
      chrome.notifications.onClicked.trigger("other-notification");
      expect(onClickCallback.called).to.equal(false);
    });

    it('should call onBreak callbacks when a pomodoro break button is clicked', function () {
      chrome.notifications.onButtonClicked.trigger("pomodoro-success", 0);
      expect(onBreakCallback.calledOnce).to.equal(true);
    });

    it('should not call onBreak callbacks when a button on some other notification is clicked', function () {
      chrome.notifications.onButtonClicked.trigger("other-notification", 0);
      expect(onBreakCallback.calledOnce).to.equal(false);
    });
  });
}());