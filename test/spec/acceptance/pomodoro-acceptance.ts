'use strict';

import NotificationHelper = require("test/helpers/notification-test-helper");

import {
  currentCityData,
  currentCityValue,
  currentCitySize
} from "test/helpers/saved-state-helper";

import {
  resetTabHelper,
  activateTab,
  closeTab,
  givenBadDomains
} from "test/helpers/tab-helper";

import {
  POMODORO_COLOUR,
  BREAK_COLOUR,
  BADGE_TEXT_COLOUR,
  BADGE_BACKGROUND_COLOUR,
  getBadgePixel,
  badgeTextColour,
} from "test/helpers/badge-helper";

const POMODORO_DURATION = 1000 * 60 * 25;
const BREAK_DURATION = 1000 * 60 * 5;

var clockStub: Sinon.SinonFakeTimers;
var notificationHelper = new NotificationHelper(() => clockStub);
var chromeStub = <typeof SinonChrome> <any> window.chrome;

function startPomodoro() {
  chromeStub.runtime.onMessage.trigger({"action": "start-pomodoro"});
}

describe('Acceptance: Pomodoros', () => {
  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  var initialCityValue: number;

  beforeEach(() => {
    resetTabHelper();
    notificationHelper.resetNotificationSpies();

    initialCityValue = currentCityValue();
  });

  afterEach(() => {
    // Make sure any active pomodoros are definitely finished
    clockStub.tick(POMODORO_DURATION);
    clockStub.reset();
  });

  it("should open the pomodoro page if the button is clicked", () => {
    chromeStub.browserAction.onClicked.trigger();

    expect(chromeStub.tabs.create.calledOnce).to.equal(true);
  });

  it("should add a building for a successful pomodoros", () => {
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);

    var resultingCityValue = currentCityValue();

    expect(resultingCityValue).to.equal(initialCityValue + 1);
  });

  it("should remove a building for failed pomodoros", () => {
    givenBadDomains("twitter.com");
    startPomodoro();
    clockStub.tick(POMODORO_DURATION);
    var initialCitySize = currentCitySize();

    startPomodoro();
    activateTab("http://twitter.com");

    var resultingCitySize = currentCitySize();
    expect(resultingCitySize).to.equal(initialCitySize - 1);
  });

  it("should do nothing if a pomodoro is started while one's already running", () => {
    startPomodoro();
    startPomodoro();
    clockStub.tick(POMODORO_DURATION - 1);
    startPomodoro();
    clockStub.tick(1);

    var resultingCityValue = currentCityValue();
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
      expect(badgeTextColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should let you take a break after your pomodoro", () => {
      notificationHelper.clickTakeABreak();
      clockStub.tick(BREAK_DURATION / 2);

      expect(badgeTextColour()).to.be.rgbPixel(BREAK_COLOUR);
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
      expect(badgeTextColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);

      clockStub.tick(POMODORO_DURATION);
      expect(badgeTextColour()).to.be.rgbPixel(BADGE_TEXT_COLOUR);
      expect(notificationHelper.spyForNotificationCreation().callCount).to.equal(0);

      expect(chromeStub.tabs.create.callCount).to.equal(0);
    });
  });

  describe("OnMessage", () => {
    beforeEach(() => notificationHelper.resetNotificationSpies());

    it("should start a pomodoro when a start message is received", () => {
      startPomodoro();

      expect(badgeTextColour()).to.be.rgbPixel(POMODORO_COLOUR);
    });

    it("should clear notifications when a start pomodoro message is received", () => {
      startPomodoro();

      expect(notificationHelper.spyForNotificationClearing().callCount).to.equal(2);
    });

    it("should start a break when a break message is received", () => {
      chromeStub.runtime.onMessage.trigger({"action": "start-break"});

      expect(badgeTextColour()).to.be.rgbPixel(BREAK_COLOUR);
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


});