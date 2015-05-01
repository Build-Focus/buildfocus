/* global describe, it */

(function () {
  'use strict';

  var NotificationService;
  var notifications;

  describe('Notification service', function () {
    before(function (done) {
      require(["notification-service"], function (loadedClass) {
        NotificationService = loadedClass;
        done();
      });
    });

    beforeEach(function () {
      notifications = new NotificationService();
    });

    it('should call onClick callbacks when a pomodoro notification is clicked', function () {
      var callback = sinon.stub();
      notifications.onClick(callback);

      chrome.notifications.onClicked.trigger("pomodoro-success");
      expect(callback.calledOnce).to.equal(true);
    });

    it('should not call onClick callbacks when some other notification is clicked', function () {
      var callback = sinon.stub();
      notifications.onClick(callback);

      chrome.notifications.onClicked.trigger("other-notification");
      expect(callback.called).to.equal(false);
    });

    it('should create success notification', function () {
      notifications.showSuccessNotification();

      expect(chrome.notifications.create.calledOnce).to.equal(true);
    });
  });
}());