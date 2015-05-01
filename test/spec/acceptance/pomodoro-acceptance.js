/* global describe, it */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
  var BREAK_DURATION = 1000 * 60 * 5;

  var clockStub;

  function setupStorageStubs() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
  }

  function resetSpies() {
    chrome.notifications.clear.reset();
    chrome.notifications.create.reset();
    chrome.tabs.executeScript.reset();
    activateTab("http://google.com");
    givenBadDomains([]);
  }

  function clickButton() {
    chrome.browserAction.onClicked.trigger();
  }

  function getBadgeText() {
    var lastBadgeCall = chrome.browserAction.setBadgeText.lastCall;

    if (lastBadgeCall) {
      var badgeTextArgs = lastBadgeCall.args;
      return badgeTextArgs[0].text;
    } else {
      return "";
    }
  }

  function getBadgeColor() {
    var lastBadgeCall = chrome.browserAction.setBadgeBackgroundColor.lastCall;

    if (lastBadgeCall) {
      var badgeColorArgs = lastBadgeCall.args;
      return badgeColorArgs[0].color;
    } else {
      return "";
    }
  }

  function getPointsOnBadge() {
    var badgeText = getBadgeText();

    // Assumes points are the only numbers in the badge
    return parseInt(badgeText.replace(/[^\-0-9]/g, ''), 10);
  }

  function isPomodoroActiveOnBadge() {
    return getBadgeColor() === "#0F0";
  }

  function activateTab(url) {
    chrome.tabs.query.yields([{ "url": url }]);
    chrome.tabs.onActivated.trigger();
  }

  function givenBadDomain(urlPattern) {
    givenBadDomains([urlPattern]);
  }

  function givenBadDomains(urlPatterns) {
    chrome.storage.onChanged.trigger({"badDomainPatterns": {"newValue": urlPatterns}});
  }

  describe('Acceptance: Pomodoros', function () {
    before(function (done) {
      // Have to wait a little to let require load, and need to stub clock only after that
      setTimeout(function () {
        clockStub = sinon.useFakeTimers();
        done();
      }, 500);
    });

    after(function () {
      clockStub.restore();
    });

    beforeEach(function () {
      // Make sure any active pomodoros are definitely finished
      clockStub.tick(POMODORO_DURATION);

      setupStorageStubs();
      resetSpies();
    });

    it("should give a point for successful pomodoros", function () {
      var initialPoints = getPointsOnBadge();

      clickButton();
      clockStub.tick(POMODORO_DURATION);

      var resultingPoints = getPointsOnBadge();

      expect(resultingPoints).to.equal(initialPoints + 1);
    });

    it("should subtract a point for failed pomodoros", function () {
      givenBadDomain("twitter.com");
      var initialPoints = getPointsOnBadge();

      clickButton();
      activateTab("http://twitter.com");

      var resultingPoints = getPointsOnBadge();
      expect(resultingPoints).to.equal(initialPoints - 1);
    });

    it("should do nothing if the pomodoro button is pressed while one's already running", function () {
      var initialPoints = getPointsOnBadge();

      clickButton();
      clickButton();
      clockStub.tick(POMODORO_DURATION - 1);
      clickButton();
      clockStub.tick(1);

      var resultingPoints = getPointsOnBadge();
      expect(resultingPoints).to.equal(initialPoints + 1);
      clockStub.tick(POMODORO_DURATION);
      expect(resultingPoints).to.equal(initialPoints + 1);
    });

    describe("Notifications", function () {
      it("should appear when a pomodoro is completed successfully", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        expect(chrome.notifications.create.calledOnce).to.equal(true);
      });

      it("should start a new pomodoro when clicked", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onClicked.trigger("pomodoro-success");

        expect(isPomodoroActiveOnBadge()).to.equal(true);
      });

      it("should let you take a break after your pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger("pomodoro-success", 0);
        clockStub.tick(BREAK_DURATION - 1);

        expect(isPomodoroActiveOnBadge()).to.equal(false);
        expect(chrome.notifications.create.callCount).to.equal(1);
      });

      it("should trigger again after your break is up", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger("pomodoro-success", 0);
        clockStub.tick(BREAK_DURATION);

        expect(chrome.notifications.create.callCount).to.equal(2);
      });

      it("should cancel your break if you start a new pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger("pomodoro-success", 0);
        clickButton();
        clockStub.tick(BREAK_DURATION);

        expect(chrome.notifications.create.callCount).to.equal(1);
      });

      it("should let you cancel pomodoro-ing after your pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger("pomodoro-success", 1);

        clockStub.tick(1);
        expect(isPomodoroActiveOnBadge()).to.equal(false);
        expect(chrome.notifications.create.callCount).to.equal(1);

        clockStub.tick(BREAK_DURATION);
        expect(isPomodoroActiveOnBadge()).to.equal(false);
        expect(chrome.notifications.create.callCount).to.equal(1);
      });
    });

    it("should show a failure page when a pomodoro is failed", function () {
      givenBadDomain("twitter.com");

      clickButton();
      activateTab("http://twitter.com");

      expect(chrome.tabs.executeScript.calledOnce).to.equal(true);
    });
  });
})();