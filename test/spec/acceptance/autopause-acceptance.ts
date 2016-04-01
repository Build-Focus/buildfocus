'use strict';

import {
  pomodoroTimeRemaining,
  isPomodoroActive,
  isPomodoroPaused,
  isBreakActive,
  currentCityValue
} from "test/helpers/saved-state-helper";

import AutopauseMode = require("app/scripts/idle-monitoring/autopause-mode");

const POMODORO_DURATION = 1000 * 60 * 25;
const IDLE_TIMEOUT = 10000;
const TIME_REMAINING_BEFORE_IDLE = POMODORO_DURATION - IDLE_TIMEOUT;
const FIFTEEN_MINUTES = 60 * 15 * 1000;

var clockStub: Sinon.SinonFakeTimers;
var chromeStub = <typeof SinonChrome> <any> window.chrome;

function givenPauseSetting(pauseMode: AutopauseMode) {
  chromeStub.storage.onChanged.trigger({"autopauseMode": {"newValue": pauseMode}});
  chromeStub.storage.sync.get.withArgs("autopauseMode").yields({ "autopauseMode": pauseMode });
}

function startPomodoro() {
  chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

describe("Acceptance: Autopause", () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  var initialCityValue: number;

  beforeEach(() => {
    chromeStub.idle.onStateChanged.trigger("active");
    initialCityValue = currentCityValue();
  });

  afterEach(() => {
    chromeStub.idle.onStateChanged.trigger("active");

    // Make sure any active pomodoros are definitely finished
    clockStub.tick(POMODORO_DURATION);
    clockStub.reset();
  });

  describe("when you go idle", () => {
    beforeEach(() => {
      givenPauseSetting(AutopauseMode.PauseOnIdleAndLock);
      startPomodoro();

      clockStub.tick(IDLE_TIMEOUT);
      chromeStub.idle.onStateChanged.trigger("idle");
    });

    it("should pause the timer", () => {
      var timeRemainingOnPause = pomodoroTimeRemaining();
      clockStub.tick(10000);
      expect(pomodoroTimeRemaining()).to.equal(timeRemainingOnPause);
    });

    it("should mark the pomodoro as paused", () => {
      expect(isPomodoroPaused()).to.equal(true, "Pomodoro should be paused");
      expect(isPomodoroActive()).to.equal(false, "Pomodoro should not be active");
      expect(isBreakActive()).to.equal(false, "Break should not be active");
    });

    describe("and then go active again less than 15 minutes later", () => {
      beforeEach(() => {
        clockStub.tick(FIFTEEN_MINUTES - 1);
        chromeStub.idle.onStateChanged.trigger("active");
      });

      it("should resume the timer from where it was", () => {
        expect(pomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE);
        clockStub.tick(1000);
        expect(pomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE - 1000);
      });

      it("should mark the pomodoro as active", () => {
        expect(isPomodoroActive()).to.equal(true, "Pomodoro should be active");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be paused");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
      });

      it("should not do anything else later when 15 minutes has indeed passed", () => {
        clockStub.tick(1000);

        expect(pomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE - 1000);
        expect(currentCityValue()).to.equal(initialCityValue, "City should not have been affected");
        expect(isPomodoroActive()).to.equal(true, "Pomodoro should be active");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be paused");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
      });
    });

    describe("and then don't go active within 15 minutes", () => {
      beforeEach(() => clockStub.tick(FIFTEEN_MINUTES));

      it("should reset the pomodoro", () => {
        expect(isPomodoroActive()).to.equal(false, "Pomodoro not should be paused");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be active");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
        expect(pomodoroTimeRemaining()).to.equal(null, "Time remaining should be nulled");
      });

      it("should not touch your city", () => {
        expect(currentCityValue()).to.equal(initialCityValue, "City should not have been affected by 15 minute idling");
      });

      describe("when the user becomes active again", () => {
        beforeEach(() => chromeStub.idle.onStateChanged.trigger("active"));

        it("should keep the pomodoro cancelled", () => {
          expect(isPomodoroActive()).to.equal(false, "Pomodoro not should be paused");
          expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be active");
          expect(isBreakActive()).to.equal(false, "Break should not be active");
          expect(pomodoroTimeRemaining()).to.equal(null, "Time remaining should be nulled");
        });
      });
    });
  });

  describe("if set to lock only", () => {
    beforeEach(() => {
      givenPauseSetting(AutopauseMode.PauseOnLock);
      startPomodoro();
    });

    it("doesn't pause on 'idle'", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(10000);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - 10000);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });

    it("doesn't eventually reset on 'idle'", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(FIFTEEN_MINUTES);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - FIFTEEN_MINUTES);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });

    it("still pauses on lock", () => {
      chromeStub.idle.onStateChanged.trigger("locked");
      clockStub.tick(10000);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION);
      expect(isPomodoroPaused()).to.equal(true);
      expect(isPomodoroActive()).to.equal(false);
    });

    it("still eventually resets on lock", () => {
      chromeStub.idle.onStateChanged.trigger("locked");
      clockStub.tick(FIFTEEN_MINUTES);

      expect(pomodoroTimeRemaining()).to.equal(null);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(false);
    });
  });

  describe("if set to never pause", () => {
    beforeEach(() => {
      givenPauseSetting(AutopauseMode.NeverPause);
      startPomodoro();
    });

    it("doesn't pause on 'idle'", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(10000);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - 10000);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });

    it("doesn't eventually reset on 'idle'", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(FIFTEEN_MINUTES);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - FIFTEEN_MINUTES);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });

    it("doesn't pause on lock", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(10000);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - 10000);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });

    it("doesn't reset on lock", () => {
      chromeStub.idle.onStateChanged.trigger("idle");
      clockStub.tick(FIFTEEN_MINUTES);

      expect(pomodoroTimeRemaining()).to.equal(POMODORO_DURATION - FIFTEEN_MINUTES);
      expect(isPomodoroPaused()).to.equal(false);
      expect(isPomodoroActive()).to.equal(true);
    });
  });
});