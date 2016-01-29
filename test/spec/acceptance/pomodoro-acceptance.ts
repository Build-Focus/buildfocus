'use strict';

import NotificationHelper = require("test/helpers/notification-test-helper");

import serialization = require('app/scripts/city/serialization/serialization-format');
import Buildings = require('app/scripts/city/buildings/buildings');
import BuildingType = require('app/scripts/city/buildings/building-type');

var POMODORO_DURATION = 1000 * 60 * 20;
var BREAK_DURATION = 1000 * 60 * 5;

var clockStub: Sinon.SinonFakeTimers;
var notificationHelper = new NotificationHelper(() => clockStub);
var chromeStub = <typeof SinonChrome> <any> window.chrome;

function resetSpies() {
  clockStub.reset();

  chromeStub.runtime.lastError = undefined;
  chromeStub.notifications.clear.reset();
  chromeStub.notifications.create.reset();
  chromeStub.tabs.create.reset();
  chromeStub.tabs.update.reset();

  chromeStub.tabs.get.yields({url: "main.html?failed=true"});
  chromeStub.tabs.update.yields();
  chromeStub.storage.sync.get.yields({});
  chromeStub.storage.local.get.yields({});

  activateTab("http://google.com");
  givenBadDomains([]);
}

function startPomodoro() {
  chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

function getCityData(): serialization.CityData {
  return _(chromeStub.storage.local.set.args).map(function (args) {
    return args[0]["city-data"];
  }).reject(_.isUndefined).last();
}

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

var POMODORO_COLOUR = [224, 5, 5];
var BREAK_COLOUR = [34, 187, 4];
var BADGE_BACKGROUND_COLOUR = [251, 184, 65];
var BADGE_TEXT_COLOUR = [0, 0, 0];

function activateTab(url) {
  chromeStub.tabs.query.yields([{ "url": url, "id": 1 }]);
  chromeStub.tabs.onActivated.trigger();
}

function closeTab() {
  chrome.runtime.lastError = { "message": "No tab with id..." };
  chromeStub.tabs.get.yields();
}

function givenBadDomain(urlPattern) {
  givenBadDomains([urlPattern]);
}

function givenBadDomains(urlPatterns) {
  chromeStub.storage.onChanged.trigger({"badDomainPatterns": {"newValue": urlPatterns}});
}

describe('Acceptance: Pomodoros', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  beforeEach(() => {
    // Make sure any active pomodoros are definitely finished
    clockStub.tick(POMODORO_DURATION);

    resetSpies();
  });

  it("should open the pomodoro page if the button is clicked", () => {
    chromeStub.browserAction.onClicked.trigger();

    expect(chromeStub.tabs.create.calledOnce).to.equal(true);
  });

  it("should add a building for a successful pomodoros", () => {
    var initialCityValue = getCityValue();

    startPomodoro();
    clockStub.tick(POMODORO_DURATION);

    var resultingCityValue = getCityValue();

    expect(resultingCityValue).to.equal(initialCityValue + 1);
  });

  it("should remove a building for failed pomodoros", () => {
    givenBadDomain("twitter.com");
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);
    var initialCitySize = getCitySize();

    startPomodoro();
    activateTab("http://twitter.com");

    var resultingCitySize = getCitySize();
    expect(resultingCitySize).to.equal(initialCitySize - 1);
  });

  it("should do nothing if a pomodoro is started while one's already running", () => {
    var initialCityValue = getCityValue();

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
      clockStub.tick(POMODORO_DURATION);
      notificationHelper.spyForNotificationCreation().reset();
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
    it("should start a pomodoro when a start message is received", () => {
      chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});

      expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should clear notifications when a start pomodoro message is received", () => {
      chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});

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
    givenBadDomain("twitter.com");

    startPomodoro();
    activateTab("http://twitter.com");
    clockStub.tick(1000);

    expect(chromeStub.tabs.update.calledOnce).to.equal(true, "should update tab url to failure page");
    expect(chromeStub.tabs.update.args[0][1].url).to.contain("main.html?failed=true&failingUrl=http%3A%2F%2Ftwitter.com");

    expect(chromeStub.tabs.create.calledOnce).to.equal(false, "should not open new failure tab");
  });

  it("should show a separate failure page when a pomodoro is failed if the tab's immediately closed", () => {
    givenBadDomain("twitter.com");

    startPomodoro();
    activateTab("http://twitter.com");
    closeTab();

    clockStub.tick(1000);
    expect(chromeStub.tabs.update.calledOnce).to.equal(true, "should try and update tab url to failure page");
    expect(chromeStub.tabs.create.calledOnce).to.equal(true, "should open new failure tab when tab update doesn't work");
  });

  it("should show a failure page if a pomodoro is started with a failing page already open", () => {
    givenBadDomain("twitter.com");
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
        givenBadDomain("twitter.com");

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
});