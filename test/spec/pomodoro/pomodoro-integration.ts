'use strict';

import ko = require('knockout');
import PomodoroService = require("app/scripts/pomodoro/pomodoro-service");

var POMODORO_DURATION = 1000 * 60 * 25;
var BREAK_DURATION = 1000 * 60 * 5;

var clockStub;
var badBehaviourMonitorFake;

var pomodoroService: PomodoroService;

function behaveBadly() {
  badBehaviourMonitorFake.currentBadTabs([{ url: "twitter.com", id: 1}]);
}

describe('Pomodoro Integration - Pomodoro service', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  beforeEach(() => {
    badBehaviourMonitorFake = { currentBadTabs: ko.observableArray([]) };
    pomodoroService = new PomodoroService(badBehaviourMonitorFake);
  });

  describe(".isActive()", () => {
    it('should be false initially', () => {
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should be true once a pomodoro's started", () => {
      pomodoroService.start();
      expect(pomodoroService.isActive()).to.equal(true);
    });

    it("should be false after a pomodoro's completed", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should be false during breaks", () => {
      pomodoroService.takeABreak();
      expect(pomodoroService.isActive()).to.equal(false);
    });
  });

  describe(".start()", () => {
    it("should call the success callback if pomodoro is completed ok", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.calledOnce).to.equal(true);
      expect(errorCallback.called).to.equal(false);
    });

    it("should not call the success callback until the end of the pomodoro", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);

      expect(successCallback.called).to.equal(false);
    });

    it("should call the error callback if a bad URL is opened", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      behaveBadly();

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
    });

    it("should call the error callback if a bad URL is open initially", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();
      badBehaviourMonitorFake.currentBadTabs([{url: "google.com", id: 1}]);

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should stop the pomodoro completely if a bad URL is open initially", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();
      badBehaviourMonitorFake.currentBadTabs([{url: "google.com", id: 1}]);

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();

      badBehaviourMonitorFake.currentBadTabs([{url: "twitter.com", id: 1}]);

      // Despite the second bad URL, no new updates should happen
      expect(successCallback.called).to.equal(false);
      expect(errorCallback.callCount).to.equal(1);
    });

    it("should never call success after an error occurred, even after full duration", () => {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.onPomodoroSuccess(successCallback);
      pomodoroService.onPomodoroFailure(errorCallback);
      pomodoroService.start();
      behaveBadly();
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.callCount).to.equal(1);
    });

    it("should ignore requests to start a pomodoro while one is in progress", () => {
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

    it("should cancel outstanding breaks if a new pomodoro is started", () => {
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

  describe(".takeABreak()", () => {
    it("should take a break, for 5 minutes", () => {
      var breakCallback = sinon.stub();

      pomodoroService.onBreakEnd(breakCallback);
      pomodoroService.takeABreak();
      clockStub.tick(BREAK_DURATION);

      expect(breakCallback.calledOnce).to.equal(true);
    });

    it("should ignore requests to take a break while a pomodoro is in progress", () => {
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

  describe(".progress()", () => {
    it("should be null initially", () => {
      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be 0% when a pomodoro is first started", () => {
      pomodoroService.start();
      expect(pomodoroService.progress()).to.equal(0);
    });

    it("should be 50% when a pomodoro is half finished", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION / 2);

      expect(pomodoroService.progress()).to.equal(50);
    });

    it("should be 99% when a pomodoro is nearly finished", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1);

      expect(pomodoroService.progress()).to.equal(99);
    });

    it("should be null when a pomodoro is completed", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be null if a pomodoro is failed half way", () => {
      pomodoroService.start();

      clockStub.tick(POMODORO_DURATION / 2);
      behaveBadly();

      expect(pomodoroService.progress()).to.equal(null);
    });

    it("should be 0% when a break is first started", () => {
      pomodoroService.takeABreak();
      expect(pomodoroService.progress()).to.equal(0);
    });

    it("should be 99% when a break is nearly completed", () => {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION - 1);

      expect(pomodoroService.progress()).to.equal(99);
    });

    it("should be null when a break is completed", () => {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION);

      expect(pomodoroService.progress()).to.equal(null);
    });
  });

  describe(".timeRemaining()", () => {
    it("should be null initially", () => {
      expect(pomodoroService.timeRemaining()).to.equal(null);
    });

    it("should be the full pomodoro time when a pomodoro is first started", () => {
      pomodoroService.start();
      expect(pomodoroService.timeRemaining()).to.equal(POMODORO_DURATION);
    });

    it("should be half the pomodoro time when a pomodoro is half finished", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION / 2);

      expect(pomodoroService.timeRemaining()).to.equal(POMODORO_DURATION / 2);
    });

    it("should be one second when a pomodoro is one second from finished", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION - 1000);

      expect(pomodoroService.timeRemaining()).to.equal(1000);
    });

    it("should be null again when a pomodoro is completed", () => {
      pomodoroService.start();
      clockStub.tick(POMODORO_DURATION);

      expect(pomodoroService.timeRemaining()).to.equal(null);
    });

    it("should be null if a pomodoro is failed half way", () => {
      pomodoroService.start();

      clockStub.tick(POMODORO_DURATION / 2);
      behaveBadly();

      expect(pomodoroService.timeRemaining()).to.equal(null);
    });

    it("should be the full break time when a break is first started", () => {
      pomodoroService.takeABreak();
      expect(pomodoroService.timeRemaining()).to.equal(BREAK_DURATION);
    });

    it("should be one second when a break is one second from completion", () => {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION - 1000);

      expect(pomodoroService.timeRemaining()).to.equal(1000);
    });

    it("should be null again when a break is completed", () => {
      pomodoroService.takeABreak();

      clockStub.tick(BREAK_DURATION);

      expect(pomodoroService.timeRemaining()).to.equal(null);
    });
  });
});
