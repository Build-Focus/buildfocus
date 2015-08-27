'use strict';

import serialization = require('app/scripts/city/city-serialization');
import Buildings = require('app/scripts/city/buildings/buildings');
import BuildingType = require('app/scripts/city/buildings/building-type');

var POMODORO_DURATION = 1000 * 60 * 20;
var BREAK_DURATION = 1000 * 60 * 5;
var NOTIFICATION_ID = "pomodoro-notification";

var clockStub: Sinon.SinonFakeTimers;
var chromeStub = <typeof SinonChrome> <any> window.chrome;

function resetSpies() {
  clockStub.reset();

  chromeStub.notifications.clear.reset();
  chromeStub.notifications.create.reset();
  chromeStub.tabs.create.reset();
  chromeStub.tabs.executeScript.reset();
  chromeStub.storage.sync.get.yields({});
  chromeStub.storage.local.get.yields({});

  activateTab("http://google.com");
  givenBadDomains([]);
}

function startPomodoro() {
  chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

function getCityData(): string {
  return _(chromeStub.storage.sync.set.args).map(function (args) {
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
    return _.sum(JSON.parse(lastStoredCityData).map.buildings, (building: Buildings.Building) => {
      return buildingPointsValue[building.buildingType]
    });
  } else {
    return 0;
  }
}

function getCitySize() {
  var lastStoredCityData = getCityData();
  if (lastStoredCityData) {
    return JSON.parse(lastStoredCityData).map.buildings.length;
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
  chromeStub.tabs.query.yields([{ "url": url }]);
  chromeStub.tabs.onActivated.trigger();
}

function givenBadDomain(urlPattern) {
  givenBadDomains([urlPattern]);
}

function givenBadDomains(urlPatterns) {
  chromeStub.storage.onChanged.trigger({"badDomainPatterns": {"newValue": urlPatterns}});
}

describe('Acceptance: Pomodoros', function () {
  before(function () {
    clockStub = sinon.useFakeTimers();
  });

  after(function () {
    clockStub.restore();
  });

  beforeEach(function () {
    // Make sure any active pomodoros are definitely finished
    clockStub.tick(POMODORO_DURATION);

    resetSpies();
  });

  it("should open the pomodoro page if the button is clicked", function () {
    chromeStub.browserAction.onClicked.trigger();

    expect(chromeStub.tabs.create.calledOnce).to.equal(true);
  });

  it("should add a building for a successful pomodoros", function () {
    var initialCityValue = getCityValue();

    startPomodoro();
    clockStub.tick(POMODORO_DURATION);

    var resultingCityValue = getCityValue();

    expect(resultingCityValue).to.equal(initialCityValue + 1);
  });

  it("should remove a building for failed pomodoros", function () {
    givenBadDomain("twitter.com");
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);
    var initialCitySize = getCitySize();

    startPomodoro();
    activateTab("http://twitter.com");

    var resultingCitySize = getCitySize();
    expect(resultingCitySize).to.equal(initialCitySize - 1);
  });

  it("should do nothing if a pomodoro is started while one's already running", function () {
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

  describe("Notifications", function () {
    it("should appear when a pomodoro is completed successfully", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      expect(chromeStub.notifications.create.calledOnce).to.equal(true);
    });

    it("should start a new pomodoro when clicked", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      chromeStub.notifications.onClicked.trigger(NOTIFICATION_ID);

      expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should let you take a break after your pomodoro", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      chromeStub.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
      clockStub.tick(BREAK_DURATION - 1);

      expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
      expect(chromeStub.notifications.create.callCount).to.equal(1);
    });

    it("should trigger again after your break is up", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      chromeStub.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
      clockStub.tick(BREAK_DURATION);

      expect(chromeStub.notifications.create.callCount).to.equal(2);
      expect(chromeStub.notifications.create.args[1][1].title).to.equal("Break time's over");
    });

    it("should cancel your break if you start a new pomodoro", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      chromeStub.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
      startPomodoro();
      clockStub.tick(BREAK_DURATION);

      expect(chromeStub.notifications.create.callCount).to.equal(1);
    });

    it("should let you cancel pomodoro-ing after your pomodoro", function () {
      startPomodoro();
      clockStub.tick(POMODORO_DURATION);

      chromeStub.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 1);

      clockStub.tick(1);
      expect(badgeIconColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(chromeStub.notifications.create.callCount).to.equal(1);

      clockStub.tick(BREAK_DURATION);
      expect(badgeIconColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(chromeStub.notifications.create.callCount).to.equal(1);
    });
  });

  describe("OnMessage", function () {
    it("should start a pomodoro when a start message is received", function () {
      chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});

      expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should clear notifications when a start pomodoro message is received", function () {
      chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});

      expect(chromeStub.notifications.clear.calledOnce).to.equal(true);
    });

    it("should start a break when a break message is received", function () {
      chromeStub.runtime.onMessage.trigger({"action": "start-break"});

      expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
      expect(chromeStub.notifications.create.called).to.equal(false);

      clockStub.tick(BREAK_DURATION);

      expect(chromeStub.notifications.create.calledOnce).to.equal(true);
      expect(chromeStub.notifications.create.args[0][1].title).to.equal("Break time's over");
    });

    it("should clear notifications when a start break message is received", function () {
      chromeStub.runtime.onMessage.trigger({"action": "start-break"});

      expect(chromeStub.notifications.clear.calledOnce).to.equal(true);
    });
  });

  it("should show a failure page when a pomodoro is failed", function () {
    givenBadDomain("twitter.com");

    startPomodoro();
    activateTab("http://twitter.com");

    clockStub.tick(1000);
    expect(chromeStub.tabs.executeScript.calledOnce).to.equal(true);
  });

  describe("Progress bar", function () {
    describe("for pomodoros", function () {
      it("shouldn't be shown initially", function () {
        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });

      it("should be 0% after starting a pomodoro", function () {
        startPomodoro();

        expect(getBadgePixel(0, 0)).to.be.transparent();
      });

      it("should be 50% half way through a pomodoro", function () {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION / 2);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.transparent();
      });

      it("should be 99% when a pomodoro is nearly completed", function () {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION - 1);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.rgbPixel(POMODORO_COLOUR);
        expect(getBadgePixel(0, 5)).to.be.rgbPixel(POMODORO_COLOUR);
      });

      it("shouldn't be shown after a pomodoro is completed", function () {
        startPomodoro();
        clockStub.tick(POMODORO_DURATION);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });

      it("shouldn't be shown after a pomodoro is failed", function () {
        givenBadDomain("twitter.com");

        startPomodoro();
        clockStub.tick(POMODORO_DURATION / 2);
        activateTab("http://twitter.com");

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });
    });

    describe("for breaks", function () {
      it("should be 0% after starting a break", function () {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        expect(getBadgePixel(0, 0)).to.be.transparent();
      });

      it("should be 50% half way through a break", function () {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION / 2);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.transparent();
      });

      it("should be 99% when a break is nearly completed", function () {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION - 1);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 18)).to.be.rgbPixel(BREAK_COLOUR);
        expect(getBadgePixel(0, 5)).to.be.rgbPixel(BREAK_COLOUR);
      });

      it("shouldn't be shown after a break is completed", function () {
        chromeStub.runtime.onMessage.trigger({"action": "start-break"});
        clockStub.tick(BREAK_DURATION);

        expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
      });
    });
  });
});