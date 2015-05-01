/* global describe, it */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
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

    it("should show a notification when completed successfully", function () {
      clickButton();
      clockStub.tick(POMODORO_DURATION);

      expect(chrome.notifications.create.calledOnce).to.equal(true);
    });

    it("should start a new pomodoro if the notification is clicked", function () {
      clickButton();
      clockStub.tick(POMODORO_DURATION);

      chrome.notifications.onClicked.trigger("pomodoro-success");

      expect(isPomodoroActiveOnBadge()).to.equal(true);
    });

    it("should show a failure page when a pomodoro is failed", function () {
      givenBadDomain("twitter.com");

      clickButton();
      activateTab("http://twitter.com");

      expect(chrome.tabs.executeScript.calledOnce).to.equal(true);
    });
  });
})();