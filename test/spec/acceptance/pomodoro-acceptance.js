/* global describe, it */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
  var clockStub;

  function setupStorageStubs() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
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

  function getPointsOnBadge() {
    var badgeText = getBadgeText();

    // Assumes points are the only numbers in the badge
    return parseInt(badgeText.replace(/[^\-0-9]/g, ''), 10);
  }

  function activateTab(url) {
    chrome.tabs.query.yields([{ "url": url }]);
    chrome.tabs.onActivated.trigger();
  }

  function givenBadDomain(urlPattern) {
    chrome.storage.onChanged.trigger({"badDomainPatterns": {"newValue": [urlPattern]}});
  }

  describe('Acceptance: Pomodoros', function () {
    before(function (done) {
      setupStorageStubs();

      // Have to wait a little to let require load, and need to stub clock only after that
      setTimeout(function () {
        clockStub = sinon.useFakeTimers();
        done();
      }, 500);
    });

    after(function () {
      clockStub.restore();
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
  });
})();