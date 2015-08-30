'use strict';

import ko = require('knockout');
import PomodoroService = require("app/scripts/pomodoro/pomodoro-service");

var POMODORO_DURATION = 1000 * 60 * 20;
var BREAK_DURATION = 1000 * 60 * 5;

var clockStub;
var badBehaviourMonitorFake;

var pomodoroService: PomodoroService;

function behaveBadly() {
  badBehaviourMonitorFake.currentBadTabs([{ url: "twitter.com", id: 1}]);
}

describe('Pomodoro Integration - Pomodoro service', function () {
  before(function () {
    clockStub = sinon.useFakeTimers();
  });

  after(function () {
    clockStub.restore();
  });

  beforeEach(function () {
    badBehaviourMonitorFake = { currentBadTabs: ko.observableArray([]) };
    pomodoroService = new PomodoroService(badBehaviourMonitorFake);
  });

  describe(".isActive()", function () {
    it('should be false initially', function () {
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should be true once a pomodoro's started", function () {
      pomodoroService.start();
      expect(pomodoroService.isActive()).to.equal(true);
    });

    it("should be false after a pomodoro's completed", function () {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should be false during breaks", function () {
      pomodoroService.takeABreak();
      expect(pomodoroService.isActive()).to.equal(false);
    });
  });

  describe(".start()", function () {
    it("should call the success callback if pomodoro is completed ok", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.calledOnce).to.equal(true);
      expect(errorCallback.called).to.equal(false);
    });

    it("should not call the success callback until the end of the pomodoro", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);

      expect(successCallback.called).to.equal(false);
    });

    it("should call the error callback if a bad URL is opened", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      behaveBadly();

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
    });

    it("should call the error callback if a bad URL is open initially", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();
      badBehaviourMonitorFake.currentBadTabs([{url: "google.com", id: 1}]);

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should never call success after an error occurred, even after full duration", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      behaveBadly();
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
    });

    it("should ignore requests to start a pomodoro while one is in progress", function () {
      var successCallback = sinon.stub();
      pomodoroService.onPomodoroSuccess(successCallback);

      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);
      pomodoroService.start();

      clockStub.tick(1);
      expect(successCallback.calledOnce).to.equal(true);

      clockStub.tick(POMODORO_DURATION);
      expect(successCallback.calledOnce).to.equal(true);
    });

    it("should cancel outstanding breaks if a new pomodoro is started", function () {
      var breakCallback = sinon.stub(), successCallback = sinon.stub();

      pomodoroService.onBreakEnd(breakCallback);
      pomodoroService.onPomodoroSuccess(successCallback);

      pomodoroService.takeABreak();
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(breakCallback.called).to.equal(false);
      expect(successCallback.called).to.equal(true);
    });
  });

  describe(".takeABreak()", function () {
    it("should take a break, for 5 minutes", function () {
      var breakCallback = sinon.stub();

      pomodoroService.onBreakEnd(breakCallback);
      pomodoroService.takeABreak();
      clockStub.tick(BREAK_DURATION);

      expect(breakCallback.calledOnce).to.equal(true);
    });

    it("should ignore requests to take a break while a pomodoro is in progress", function () {
      var successCallback = sinon.stub(), breakCallback = sinon.stub();
      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onBreakEnd(breakCallback);

      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);
      pomodoroService.takeABreak();

      clockStub.tick(1);
      expect(successCallback.calledOnce).to.equal(true);

      clockStub.tick(BREAK_DURATION);
      expect(breakCallback.called).to.equal(false);
    });
  });

  describe(".progress()", function () {
    it("should be null initially", function () {
      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be 0% when a pomodoro is first started", function () {
      pomodoroService.start();
      expect(pomodoroService.progress()).to.equal(0);
    });

    it("should be 50% when a pomodoro is half finished", function () {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION / 2);

      expect(pomodoroService.progress()).to.equal(50);
    });

    it("should be 99% when a pomodoro is nearly finished", function () {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);

      expect(pomodoroService.progress()).to.equal(99);
    });

    it("should be null when a pomodoro is completed", function () {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be null if a pomodoro is failed half way", function () {
      pomodoroService.start();

      clockStub.tick(POMODORO_DURATION / 2);
      behaveBadly();

      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be 0% when a break is first started", function () {
      pomodoroService.takeABreak();
      expect(pomodoroService.progress()).to.equal(0);
    });

    it("should be 99% when a break is nearly completed", function () {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION - 1);

      expect(pomodoroService.progress()).to.equal(99);
    });

    it("should be null when a break is completed", function () {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION);

      expect(pomodoroService.progress()).to.equal(null);
    });
  });
});