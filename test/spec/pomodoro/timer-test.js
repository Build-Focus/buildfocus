/* global describe, it */

(function () {
  'use strict';

  var Timer;
  var clockStub;

  describe('A timer', function () {
    beforeEach(function (done) {
      require(["pomodoro/timer"], function (loadedClass) {
        clockStub = sinon.useFakeTimers();
        Timer = loadedClass;
        done();
      });
    });

    afterEach(function () {
      clockStub.restore();
    });

    it('should not be running initially', function () {
      var timer = new Timer();

      expect(timer.isRunning()).to.equal(false);
    });

    it("should be running once it's started", function () {
      var timer = new Timer();
      timer.start();

      expect(timer.isRunning()).to.equal(true);
    });

    it("should not be running if started then reset", function () {
      var timer = new Timer();

      timer.start();
      timer.reset();

      expect(timer.isRunning()).to.equal(false);
    });

    it("should be running before the duration is completed", function () {
      var timer = new Timer();

      timer.start(1000);
      clockStub.tick(500);

      expect(timer.isRunning()).to.equal(true);
    });

    it("should not be running after the given duration is completed", function () {
      var timer = new Timer();

      timer.start(1000);
      clockStub.tick(1000);

      expect(timer.isRunning()).to.equal(false);
    });

    it("should call the callback on the duration is completed", function (done) {
      var timer = new Timer();

      timer.start(1000, function () {
        done();
      });
      clockStub.tick(1000);
    });
  });
})();