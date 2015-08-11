'use strict';

import Timer = require("app/scripts/pomodoro/timer");

var clockStub;

describe('Timer', function () {
  before(function () {
    clockStub = sinon.useFakeTimers();
  });

  after(function () {
    clockStub.restore();
  });

  it('should not be running initially', function () {
    var timer = new Timer();

    expect(timer.isRunning()).to.equal(false);
  });

  it("should be running once it's started", function () {
    var timer = new Timer();
    timer.start(1000, sinon.stub());

    expect(timer.isRunning()).to.equal(true);
  });

  it("should not be running if started then reset", function () {
    var timer = new Timer();

    timer.start(1000, sinon.stub());
    timer.reset();

    expect(timer.isRunning()).to.equal(false);
  });

  it("should be running before the duration is completed", function () {
    var timer = new Timer();

    timer.start(1000, sinon.stub());
    clockStub.tick(500);

    expect(timer.isRunning()).to.equal(true);
  });

  it("should not be running after the given duration is completed", function () {
    var timer = new Timer();

    timer.start(1000, sinon.stub());
    clockStub.tick(1000);

    expect(timer.isRunning()).to.equal(false);
  });

  it("should call the callback on the duration is completed", function () {
    var timer = new Timer();
    var callback = sinon.stub();

    timer.start(1000, callback);
    clockStub.tick(1000);

    expect(callback.called).to.equal(true);
  });

  it("should only call the callback once", function () {
    var timer = new Timer();
    var callback = sinon.stub();

    timer.start(1000, callback);

    clockStub.tick(2000);
    expect(callback.callCount).to.equal(1);
  });

  it("should never call the callback if reset", function () {
    var timer = new Timer();
    var callback = sinon.stub();

    timer.start(1000, callback);
    clockStub.tick(500);
    timer.reset();

    clockStub.tick(2000);
    expect(callback.callCount).to.equal(0);
  });

  describe("progress", function () {
    it("should start at 0%", function () {
      var timer = new Timer();
      expect(timer.progress()).to.equal(0);
    });

    it("should be at 50% half way through", function () {
      var timer = new Timer();

      timer.start(10000, sinon.stub());
      clockStub.tick(5000);

      expect(timer.progress()).to.equal(50);
    });

    it("should be at 99% just before completion", function () {
      var timer = new Timer();

      timer.start(10000, sinon.stub());
      clockStub.tick(9999);

      expect(timer.progress()).to.equal(99);
    });

    it("should be at 100% after completion", function () {
      var timer = new Timer();

      timer.start(10000, sinon.stub());
      clockStub.tick(10000);

      expect(timer.progress()).to.equal(100);
    });

    it("should reset to 0% on restart", function () {
      var timer = new Timer();

      timer.start(10000, sinon.stub());
      clockStub.tick(10000);
      timer.start(10000, sinon.stub());

      expect(timer.progress()).to.equal(0);
    });
  });
});