'use strict';

import Timer = require("app/scripts/pomodoro/timer");

var clockStub;

describe('Timer', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  describe(".isRunning", () => {
    it('should be false initially', () => {
      var timer = new Timer();

      expect(timer.isRunning()).to.equal(false);
    });

    it("should be true once the timer's started", () => {
      var timer = new Timer();
      timer.start(1000, sinon.stub());

      expect(timer.isRunning()).to.equal(true);
    });

    it("should be false if started then reset", () => {
      var timer = new Timer();

      timer.start(1000, sinon.stub());
      timer.reset();

      expect(timer.isRunning()).to.equal(false);
    });

    it("should be true until the duration is completed", () => {
      var timer = new Timer();

      timer.start(1000, sinon.stub());
      clockStub.tick(500);

      expect(timer.isRunning()).to.equal(true);
    });

    it("should be false after the given duration is completed", () => {
      var timer = new Timer();

      timer.start(1000, sinon.stub());
      clockStub.tick(1000);

      expect(timer.isRunning()).to.equal(false);
    });
  });

  describe("start callback", () => {
    it("should cbe called when the duration is completed", () => {
      var timer = new Timer();
      var callback = sinon.stub();

      timer.start(1000, callback);
      clockStub.tick(1000);

      expect(callback.called).to.equal(true);
    });

    it("should only be called once", () => {
      var timer = new Timer();
      var callback = sinon.stub();

      timer.start(1000, callback);

      clockStub.tick(2000);
      expect(callback.callCount).to.equal(1);
    });

    it("should never be called if the timer is reset", () => {
      var timer = new Timer();
      var callback = sinon.stub();

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

      timer.start(100000, sinon.stub());

      expect(timer.progress()).to.equal(0);
    });

    it("should be at 50% half way through", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(50000);

      expect(timer.progress()).to.equal(50);
    });

    it("should be at 99% just before completion", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(99999);

      expect(timer.progress()).to.equal(99);
    });

    it("should be at 100% after completion", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(100000);

      expect(timer.progress()).to.equal(100);
    });

    it("should reset to 0 on restart", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(100000);
      timer.start(200000, sinon.stub());

      expect(timer.progress()).to.equal(0);
    });
  });

  describe("time remaining", () => {
    it("should be null when the timer isn't running", () => {
      var timer = new Timer();

      expect(timer.timeRemaining()).to.equal(null);
    });

    it("should start at the full time", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());

      expect(timer.timeRemaining()).to.equal(100000);
    });

    it("should be at half the initial time half way through", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(50000);

      expect(timer.timeRemaining()).to.equal(50000);
    });

    it("should be at one second, one second just before completion", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(90000);

      expect(timer.timeRemaining()).to.equal(10000);
    });

    it("should be at 0 after completion", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(100000);

      expect(timer.timeRemaining()).to.equal(0);
    });

    it("should reset to the full time on restart", () => {
      var timer = new Timer();

      timer.start(100000, sinon.stub());
      clockStub.tick(100000);
      timer.start(200000, sinon.stub());

      expect(timer.timeRemaining()).to.equal(200000);
    });
  });
});