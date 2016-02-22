'use strict';

import NotificationHelper = require("test/helpers/notification-test-helper");

import serialization = require('app/scripts/city/serialization/serialization-format');
import Buildings = require('app/scripts/city/buildings/buildings');
import BuildingType = require('app/scripts/city/buildings/building-type');

import PomodoroState = require("app/scripts/pomodoro/pomodoro-state");

import {
  resetTabHelper,
  activateTab,
  closeTab,
  givenBadDomains
} from "test/helpers/tab-helper";

var POMODORO_DURATION = 1000 * 60 * 25;
var BREAK_DURATION = 1000 * 60 * 5;

var clockStub: Sinon.SinonFakeTimers;
var notificationHelper = new NotificationHelper(() => clockStub);
var chromeStub = <typeof SinonChrome> <any> window.chrome;

function getLastSavedValue(valueKey: string, storageType: string = "local"): any {
  return _(chromeStub.storage[storageType].set.args).map(args => args[0][valueKey]).reject(_.isUndefined).last();
}

var getCityData = () => <serialization.CityData> getLastSavedValue("city-data");
var getPomodoroTimeRemaining = () => <number> getLastSavedValue("pomodoro-service-time-remaining");
var isPomodoroActive = () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Active;
var isPomodoroPaused = () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Paused;
var isBreakActive =    () => getLastSavedValue("pomodoro-service-state") === PomodoroState.Break;

function getCityValue() {
  var lastStoredCityData = getCityData();

  var buildingPointsValue = {
    [BuildingType.BasicHouse]: 1,
    [BuildingType.NiceHouse]: 2,
    [BuildingType.FancyHouse]: 5
  };

  if (lastStoredCityData) {
    return _.sum(lastStoredCityData.map.buildings, (building: Buildings.Building) => {
      return buildingPointsValue[building.buildingType]
    });
  } else {
    return 0;
  }
}

function getCitySize() {
  var lastStoredCityData = getCityData();
  if (lastStoredCityData) {
    return lastStoredCityData.map.buildings.length;
  } else {
    return 0;
  }
}

function getBadgeImageData() {
  var lastSetIconCall = chromeStub.browserAction.setIcon.lastCall;

  if (lastSetIconCall) {
    return lastSetIconCall.args[0].imageData;
  } else {
    return null;
  }
}

function getBadgePixel(x, y) {
  var image = getBadgeImageData();
  var data = image.data;

  var pixelIndex = image.width * y + x;
  var pixelByteIndex = pixelIndex * 4;
  return [data[pixelByteIndex],
          data[pixelByteIndex+1],
          data[pixelByteIndex+2],
          data[pixelByteIndex+3]];
}

function badgeIconColour() {
  return getBadgePixel(11, 5); // Top left of the F
}

function startPomodoro() {
  chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

var POMODORO_COLOUR = [224, 5, 5];
var BREAK_COLOUR = [34, 187, 4];
var BADGE_BACKGROUND_COLOUR = [251, 184, 65];
var BADGE_TEXT_COLOUR = [0, 0, 0];

describe('Acceptance: Pomodoros', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  var initialCityValue: number;

  beforeEach(() => {
    // Make sure any active pomodoros are definitely finished
    chromeStub.idle.onStateChanged.trigger("active");
    clockStub.tick(POMODORO_DURATION);
    clockStub.reset();

    resetTabHelper();
    notificationHelper.resetNotificationSpies();

    initialCityValue = getCityValue();
  });

  it("should open the pomodoro page if the button is clicked", () => {
    chromeStub.browserAction.onClicked.trigger();

    expect(chromeStub.tabs.create.calledOnce).to.equal(true);
  });

  it("should add a building for a successful pomodoros", () => {
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);

    var resultingCityValue = getCityValue();

    expect(resultingCityValue).to.equal(initialCityValue + 1);
  });

  it("should remove a building for failed pomodoros", () => {
    givenBadDomains("twitter.com");
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);
    var initialCitySize = getCitySize();

    startPomodoro();
    activateTab("http://twitter.com");

    var resultingCitySize = getCitySize();
    expect(resultingCitySize).to.equal(initialCitySize - 1);
  });

  it("should do nothing if a pomodoro is started while one's already running", () => {
    startPomodoro();
    startPomodoro();
    clockStub.tick(POMODORO_DURATION - 1);
    startPomodoro();
    clockStub.tick(1);

    var resultingCityValue = getCityValue();
    expect(resultingCityValue).to.equal(initialCityValue + 1);
    clockStub.tick(POMODORO_DURATION);
    expect(resultingCityValue).to.equal(initialCityValue + 1);
  });

  describe("Notifications", () => {
    beforeEach(() => {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION + 1);
      notificationHelper.resetNotificationSpies();
    });

    it("should appear when a pomodoro is completed successfully", () => {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      expect(notificationHelper.spyForResultNotificationCreation().callCount).to.equal(1);
      expect(notificationHelper.spyForActionNotificationCreation().callCount).to.equal(1);
    });

    it("should show the new building, if you complete a pomodoro", () => {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      expect(notificationHelper.spyForResultNotificationCreation().args[0][1].iconUrl).to.include("images/city/");
    });

    it("should open the focus page if you click the new building notification", () => {
      notificationHelper.clickViewCity();
      expect(chromeStub.tabs.create.calledOnce).to.equal(true);
    });

    it("should let you start a new pomodoro", () => {
      notificationHelper.clickStartPomodoro();
      expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should let you take a break after your pomodoro", () => {
      notificationHelper.clickTakeABreak();
      clockStub.tick(BREAK_DURATION / 2);

      expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);
    });

    it("should trigger again after your break is up", () => {
      notificationHelper.clickTakeABreak();
      clockStub.tick(BREAK_DURATION);

      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(1);
      expect(notificationHelper.spyForNotificationCreation().args[0][1].title).to.equal("Break time's over");
    });

    it("should cancel your break if you start a new pomodoro", () => {
      notificationHelper.clickTakeABreak();
      startPomodoro();
      clockStub.tick(BREAK_DURATION);

      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);
    });

    it("should let you cancel pomodoro-ing after your pomodoro", () => {
      notificationHelper.clickNotNow();

      clockStub.tick(1);
      expect(badgeIconColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);

      clockStub.tick(POMODORO_DURATION);
      expect(badgeIconColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);

      expect(chromeStub.tabs.create.callCount).to.equal(0);
    });
  });

  describe("OnMessage", () => {
    beforeEach(() => notificationHelper.resetNotificationSpies());

    it("should start a pomodoro when a start message is received", () => {
      startPomodoro();

      expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should clear notifications when a start pomodoro message is received", () => {
      startPomodoro();

      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should start a break when a break message is received", () => {
      chromeStub.runtime.onMessage.trigger({"action": "start-break"});

      expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
      expect(chromeStub.notifications.create.called).to.equal(false);

      clockStub.tick(BREAK_DURATION);

      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(1);
      expect(notificationHelper.spyForNotificationCreation().args[0][1].title).to.equal("Break time's over");
    });

    it("should clear notifications when a start break message is received", () => {
      chromeStub.runtime.onMessage.trigger({"action": "start-break"});

      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });
  });

  it("should show a failure page when a pomodoro is failed", () => {
    givenBadDomains("twitter.com");

    startPomodoro();
    activateTab("http://twitter.com");
    clockStub.tick(1000);

    expect(chromeStub.tabs.update.calledOnce).to.equal(true, "should update tab url to failure page");
    expect(chromeStub.tabs.update.args[0][1].url).to.contain("main.html?failed=true&failingUrl=http%3A%2F%2Ftwitter.com");

    expect(chromeStub.tabs.create.calledOnce).to.equal(false, "should not open new failure tab");
  });

  it("should show a separate failure page when a pomodoro is failed if the tab's immediately closed", () => {
    givenBadDomains("twitter.com");

    startPomodoro();
    activateTab("http://twitter.com");
    closeTab();

    clockStub.tick(1000);
    expect(chromeStub.tabs.update.calledOnce).to.equal(true, "should try and update tab url to failure page");
    expect(chromeStub.tabs.create.calledOnce).to.equal(true, "should open new failure tab when tab update doesn't work");
  });

  it("should show a failure page if a pomodoro is started with a failing page already open", () => {
    givenBadDomains("twitter.com");
    activateTab("http://twitter.com");

    startPomodoro();
    clockStub.tick(500);

    expect(chromeStub.tabs.update.calledOnce).to.equal(true, "should update tab url to failure page");
    expect(chromeStub.tabs.update.args[0][1].url).to.contain("main.html?failed=true&failingUrl=http%3A%2F%2Ftwitter.com");

    expect(chromeStub.tabs.create.calledOnce).to.equal(false, "should not open new failure tab");
  });

  describe("Progress bar", () => {
    describe("for pomodoros", () => {
      it("shouldn't be shown initially", () => {
        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });

      it("should be 0% after starting a pomodoro", () => {
        startPomodoro();

        expect(getBadgePixel(0, 0)).to.be.transparent();
      });

      it("should be 50% half way through a pomodoro", () => {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION / 2);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.transparent();
      });

      it("should be 99% when a pomodoro is nearly completed", () => {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION - 1);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 5)).to.be.rgbPixel(POMODORO_COLOUR);
      });

      it("shouldn't be shown after a pomodoro is completed", () => {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });

      it("shouldn't be shown after a pomodoro is failed", () => {
        givenBadDomains("twitter.com");

        startPomodoro();
        clockStub.tick(POMODORO_DURATION / 2);
        activateTab("http://twitter.com");

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });
    });

    describe("for breaks", () => {
      it("should be 0% after starting a break", () => {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        expect(getBadgePixel(0, 0)).to.be.transparent();
      });

      it("should be 50% half way through a break", () => {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION / 2);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.transparent();
      });

      it("should be 99% when a break is nearly completed", () => {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION - 1);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 5)).to.be.rgbPixel(BREAK_COLOUR);
      });

      it("shouldn't be shown after a break is completed", () => {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });
    });
  });

  describe("when you go idle", () => {
    const TIME_REMAINING_BEFORE_IDLE = POMODORO_DURATION - 10000;

    beforeEach(() => {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION - TIME_REMAINING_BEFORE_IDLE);
      chromeStub.idle.onStateChanged.trigger("idle");
    });

    it("should pause the timer", () => {
      var timeRemainingOnPause = getPomodoroTimeRemaining();
      clockStub.tick(10000);
      expect(getPomodoroTimeRemaining()).to.equal(timeRemainingOnPause);
    });

    it("should mark the pomodoro as paused", () => {
      expect(isPomodoroPaused()).to.equal(true, "Pomodoro should be paused");
      expect(isPomodoroActive()).to.equal(false, "Pomodoro should not be active");
      expect(isBreakActive()).to.equal(false, "Break should not be active");
    });

    it("should not show any notifications", () => {
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);
    });

    const FIFTEEN_MINUTES = 60 * 15 * 1000;

    describe("and then go active again less than 15 minutes later", () => {
      beforeEach(() => {
        clockStub.tick(FIFTEEN_MINUTES - 1);
        chromeStub.idle.onStateChanged.trigger("active");
      });

      it("should resume the timer from where it was", () => {
        expect(getPomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE);
        clockStub.tick(1000);
        expect(getPomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE - 1000);
      });

      it("should mark the pomodoro as active", () => {
        expect(isPomodoroActive()).to.equal(true, "Pomodoro should be active");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be paused");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
      });

      it("should still not show any notifications", () => {
        expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);
      });

      it("should not do anything else later when 15 minutes has indeed passed", () => {
        clockStub.tick(1000);

        expect(getPomodoroTimeRemaining()).to.equal(TIME_REMAINING_BEFORE_IDLE - 1000);
        expect(getCityValue()).to.equal(initialCityValue, "City should not have been affected");
        expect(isPomodoroActive()).to.equal(true, "Pomodoro should be active");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be paused");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
        expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0, "No notifications should be fired");
      });
    });

    describe("and then don't go active within 15 minutes", () => {
      beforeEach(() => clockStub.tick(FIFTEEN_MINUTES));

      it("should reset the pomodoro", () => {
        expect(isPomodoroActive()).to.equal(false, "Pomodoro not should be paused");
        expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be active");
        expect(isBreakActive()).to.equal(false, "Break should not be active");
        expect(getPomodoroTimeRemaining()).to.equal(null, "Time remaining should be nulled");
      });

      it("should not touch your city", () => {
        expect(getCityValue()).to.equal(initialCityValue, "City should not have been affected by 15 minute idling");
      });

      it("should not fire a notification", () => {
        expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);
      });

      describe("when the user becomes active again", () => {
        it("should keep the pomodoro cancelled", () => {
          expect(isPomodoroActive()).to.equal(false, "Pomodoro not should be paused");
          expect(isPomodoroPaused()).to.equal(false, "Pomodoro should not be active");
          expect(isBreakActive()).to.equal(false, "Break should not be active");
          expect(getPomodoroTimeRemaining()).to.equal(null, "Time remaining should be nulled");
        });

        xit("should fire a notification explaining what happened", () => {
          expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(1);
        });
      });
    });
  });
});