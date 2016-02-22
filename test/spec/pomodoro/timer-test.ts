'use strict';

import Timer = require("app/scripts/pomodoro/timer");

var clockStub;

describe('Timer', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  var timer: Timer;
  var callback: Sinon.SinonStub;
  beforeEach(() => {
    timer = new Timer();
    callback = sinon.stub();
  });

  describe(".isRunning", () => {
    it('should be false initially', () => {
      expect(timer.isRunning()).to.equal(false);
    });

    it("should be true once the timer's started", () => {
      timer.start(1000, callback);

      expect(timer.isRunning()).to.equal(true);
    });

    it("should be false if started then reset", () => {
      timer.start(1000, callback);
      timer.reset();

      expect(timer.isRunning()).to.equal(false);
    });

    it("should be true until the duration is completed", () => {
      timer.start(1000, callback);
      clockStub.tick(500);

      expect(timer.isRunning()).to.equal(true);
    });

    it("should be false after the given duration is completed", () => {
      timer.start(1000, callback);
      clockStub.tick(1000);

      expect(timer.isRunning()).to.equal(false);
    });
  });

  describe("start callback", () => {
    it("should be called when the duration is completed", () => {
      timer.start(1000, callback);
      clockStub.tick(1000);

      expect(callback.called).to.equal(true);
    });

    it("should only be called once", () => {
      timer.start(1000, callback);

      clockStub.tick(2000);
      expect(callback.callCount).to.equal(1);
    });

    it("should never be called if the timer is reset", () => {
      timer.start(1000, callback);
      clockStub.tick(500);
      timer.reset();

      clockStub.tick(2000);
      expect(callback.callCount).to.equal(0);
    });
  });

  describe("progress", () => {
    it("should be null when the timer isn't running", () => {
      var timer = new Timer();

      expect(timer.progress()).to.equal(null);
    });

    it("should start at 0%", () => {
      var timer = new Timer();

      timer.start(100000, callback);

      expect(timer.progress()).to.equal(0);
    });

    it("should be at 50% half way through", () => {
      var timer = new Timer();

      timer.start(100000, callback);
      clockStub.tick(50000);

      expect(timer.progress()).to.equal(50);
    });

    it("should be at 99% just before completion", () => {
      var timer = new Timer();

      timer.start(100000, callback);
      clockStub.tick(99999);

      expect(timer.progress()).to.equal(99);
    });

    it("should be at 100% after completion", () => {
      var timer = new Timer();

      timer.start(100000, callback);
      clockStub.tick(100000);

      expect(timer.progress()).to.equal(100);
    });

    it("should reset to 0 on restart", () => {
      var timer = new Timer();

      timer.start(100000, callback);
      clockStub.tick(100000);
      timer.start(200000, callback);

      expect(timer.progress()).to.equal(0);
    });
  });

  describe("time remaining", () => {
    it("should be null when the timer isn't running", () => {
      expect(timer.timeRemaining()).to.equal(null);
    });

    it("should start at the full time", () => {
      timer.start(100000, callback);

      expect(timer.timeRemaining()).to.equal(100000);
    });

    it("should be at half the initial time half way through", () => {
      timer.start(100000, callback);
      clockStub.tick(50000);

      expect(timer.timeRemaining()).to.equal(50000);
    });

    it("should be at one second, one second just before completion", () => {
      timer.start(100000, callback);
      clockStub.tick(90000);

      expect(timer.timeRemaining()).to.equal(10000);
    });

    it("should be at 0 after completion", () => {
      timer.start(100000, callback);
      clockStub.tick(100000);

      expect(timer.timeRemaining()).to.equal(0);
    });

    it("should reset to the full time on restart", () => {
      timer.start(100000, callback);
      clockStub.tick(100000);
      timer.start(200000, callback);

      expect(timer.timeRemaining()).to.equal(200000);
    });
  });

  describe("Pause", () => {
    beforeEach(() => {
      timer.start(100000, callback);
      clockStub.tick(1000);

      timer.pause();
      clockStub.tick(1000);
    });

    it("should mark the timer as not running", () => {
      expect(timer.isRunning()).to.equal(false);
    });

    it("should mark the timer as paused", () => {
      expect(timer.isPaused()).to.equal(true);
    });

    it("should stop the time remaining decrementing", () => {
      var initialTimeRemaining = timer.timeRemaining();
      clockStub.tick(1000);
      expect(timer.timeRemaining()).to.equal(initialTimeRemaining);
    });

    it("should stop the progress increasing", () => {
      var initialProgress = timer.progress();
      clockStub.tick(1000);
      expect(timer.progress()).to.equal(initialProgress);
    });

    it("should stop the timer from completing", () => {
      clockStub.tick(100000);
      expect(callback.callCount).to.equal(0, "Completion callback should not have been called");
    });

    it("should do nothing if the timer is not active", () => {
      timer = new Timer();
      timer.pause();

      expect(timer.isPaused()).to.equal(false, "Timer should not be pausable before it's started");
      expect(timer.isRunning()).to.equal(false, "Timer should not be running before it's started");
      expect(timer.progress()).to.equal(null, "Timer should have null progress before it's started");
      expect(timer.timeRemaining()).to.equal(null, "Timer should have null time remaining before it's started");
    });

    describe("followed by resume", () => {
      it("should continue decrementing time remaining from where it left off", () => {
        var timeRemainingWhenPaused = timer.timeRemaining();

        timer.resume();
        expect(timer.timeRemaining()).to.equal(timeRemainingWhenPaused);

        clockStub.tick(1000);
        expect(timer.timeRemaining()).to.equal(timeRemainingWhenPaused - 1000);
      });

      it("should continue increasing progress from where it left off", () => {
        var progressWhenPaused = timer.progress();

        timer.resume();
        expect(timer.progress()).to.equal(progressWhenPaused);

        clockStub.tick(1000);
        expect(timer.progress()).to.equal(progressWhenPaused * 2);
      });

      it("should complete the timer at the new correct time", () => {
        var timeRemainingWhenPaused = timer.timeRemaining();

        clockStub.tick(1000);
        timer.resume();

        clockStub.tick(timeRemainingWhenPaused - 1);
        expect(callback.called).to.equal(false, "Callback should not be called early");

        clockStub.tick(timeRemainingWhenPaused);
        expect(callback.called).to.equal(true, "Callback should be called when the post-resume time runs out");
      });

      it("should do nothing if the timer is not paused", () => {
        timer = new Timer();
        timer.resume();

        expect(timer.isPaused()).to.equal(false, "Timer should not be pausable before it's started");
        expect(timer.isRunning()).to.equal(false, "Timer should not be running before it's started");
        expect(timer.progress()).to.equal(null, "Timer should have null progress before it's started");
        expect(timer.timeRemaining()).to.equal(null, "Timer should have null time remaining before it's started");
      });
    });

    describe("followed by reset", () => {
      beforeEach(() => timer.reset());

      it("should set the timer back to being inactive", () => {
        expect(timer.isPaused()).to.equal(false, "Timer should not be pausable before it's started");
        expect(timer.isRunning()).to.equal(false, "Timer should not be running before it's started");
        expect(timer.progress()).to.equal(null, "Timer should have null progress before it's started");
        expect(timer.timeRemaining()).to.equal(null, "Timer should have null time remaining before it's started");
      });

      it("should result in a timer than can be started again like normal", () => {
        timer.start(1000, callback);

        expect(timer.isRunning()).to.equal(true, "Timer should be running");
        expect(timer.isPaused()).to.equal(false, "Timer should not be paused");
        expect(timer.progress()).to.equal(0, "Timer should be back at 0 progress");
        expect(timer.timeRemaining()).to.equal(1000, "Timer should be back at the full time remaining");
      });
    });
  });
});