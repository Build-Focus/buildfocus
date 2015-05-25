/* global describe, it */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
  var BREAK_DURATION = 1000 * 60 * 5;
  var pomodoroService;

  var clockStub;
  var badBehaviourMonitorFake;

  function announceBadBehaviour() {
    var badBehaviourCallback = badBehaviourMonitorFake.onBadBehaviour.firstCall.args[0];
    badBehaviourCallback();
  }

  describe('Pomodoro monitoring service', function () {
    beforeEach(function (done) {
      badBehaviourMonitorFake = {
        onBadBehaviour: sinon.spy(),
        removeBadBehaviourCallback: sinon.spy()
      };

      require(["pomodoro/pomodoro-service"], function (PomodoroService) {
        clockStub = sinon.useFakeTimers();
        pomodoroService = new PomodoroService(badBehaviourMonitorFake);
        done();
      });
    });

    afterEach(function () {
      clockStub.restore();
    });

    it('should not be running a pomodoro initially', function () {
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should be running once a pomodoro's started", function () {
      pomodoroService.start(sinon.stub(), sinon.stub());
      expect(pomodoroService.isActive()).to.equal(true);
    });

    it("should not be running during breaks", function () {
      pomodoroService.takeABreak(sinon.stub());
      expect(pomodoroService.isActive()).to.equal(false);
    });

    it("should call the success callback if pomodoro is completed ok", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.start(successCallback, errorCallback);
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.calledOnce).to.equal(true);
      expect(errorCallback.called).to.equal(false);
    });

    it("should not call the success callback until the end of the pomodoro", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.start(successCallback, errorCallback);
      clockStub.tick(POMODORO_DURATION - 1);

      expect(successCallback.called).to.equal(false);
    });

    it("should call the error callback if a bad URL is opened", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.start(successCallback, errorCallback);
      announceBadBehaviour();

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
    });

    it("should never call success after an error occurred, even after full duration", function () {
      var successCallback = sinon.stub(), errorCallback = sinon.stub();

      pomodoroService.start(successCallback, errorCallback);
      announceBadBehaviour();
      clockStub.tick(POMODORO_DURATION);

      expect(successCallback.called).to.equal(false);
      expect(errorCallback.calledOnce).to.equal(true);
    });

    it("should throw an exception if a pomodoro is started while one is in progress", function () {
      pomodoroService.start(sinon.stub(), sinon.stub());

      expect(function () {
        pomodoroService.start(sinon.stub(), sinon.stub());
      }).to.throw();
    });

    it("should take a break for 5 minutes", function () {
      var breakCallback = sinon.stub();

      pomodoroService.takeABreak(breakCallback);
      clockStub.tick(BREAK_DURATION);

      expect(breakCallback.calledOnce).to.equal(true);
    });

    it("should cancel outstanding breaks if a new pomodoro is started", function () {
      var breakCallback = sinon.stub(), successCallback = sinon.stub();

      pomodoroService.takeABreak(breakCallback);
      pomodoroService.start(successCallback, sinon.stub());
      clockStub.tick(POMODORO_DURATION);

      expect(breakCallback.called).to.equal(false);
      expect(successCallback.called).to.equal(true);
    });

    describe("progress", function () {
      it("should be null initially", function () {
        expect(pomodoroService.progress()).to.equal(null);
      });

      it("should be 0% when a pomodoro is first started", function () {
        pomodoroService.start(sinon.stub(), sinon.stub());
        expect(pomodoroService.progress()).to.equal(0);
      });

      it("should be 50% when a pomodoro is half finished", function () {
        pomodoroService.start(sinon.stub(), sinon.stub());
        clockStub.tick(POMODORO_DURATION / 2);

        expect(pomodoroService.progress()).to.equal(50);
      });

      it("should be 99% when a pomodoro is nearly finished", function () {
        pomodoroService.start(sinon.stub(), sinon.stub());
        clockStub.tick(POMODORO_DURATION - 1);

        expect(pomodoroService.progress()).to.equal(99);
      });

      it("should be null when a pomodoro is completed", function () {
        pomodoroService.start(sinon.stub(), sinon.stub());
        clockStub.tick(POMODORO_DURATION);

        expect(pomodoroService.progress()).to.equal(null);
      });

      it("should be null if a pomodoro is failed half way", function () {
        pomodoroService.start(sinon.stub(), sinon.stub());

        clockStub.tick(POMODORO_DURATION / 2);
        announceBadBehaviour();

        expect(pomodoroService.progress()).to.equal(null);
      });

      it("should be 0% when a break is first started", function () {
        pomodoroService.takeABreak(sinon.stub());
        expect(pomodoroService.progress()).to.equal(0);
      });

      it("should be 99% when a break is nearly completed", function () {
        pomodoroService.takeABreak(sinon.stub());

        clockStub.tick(BREAK_DURATION - 1);

        expect(pomodoroService.progress()).to.equal(99);
      });

      it("should be null when a break is completed", function () {
        pomodoroService.takeABreak(sinon.stub());

        clockStub.tick(BREAK_DURATION);

        expect(pomodoroService.progress()).to.equal(null);
      });
    });
  });
})();