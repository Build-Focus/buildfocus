/* global describe, it, _ */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
  var BREAK_DURATION = 1000 * 60 * 5;
  var NOTIFICATION_ID = "rivet-pomodoro-notification";

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

  function getPoints() {
    var lastStoredPoints = _(chrome.storage.sync.set.args).map(function (args) {
      return args[0].points;
    }).reject(_.isUndefined).last();

    return lastStoredPoints || 0;
  }

  function getBadgeImageData() {
    var lastSetIconCall = chrome.browserAction.setIcon.lastCall;

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

  function isPomodoroActive() {
    var expectedPixelMatcher = _.matches([224, 5, 5, 255]); // Bright red
    var pixelData = getBadgePixel(10, 3); // Top line of the R

    return expectedPixelMatcher(pixelData);
  }

  function isBreakActive() {
    var expectedPixelMatcher = _.matches([224, 5, 5, 255]); // Bright red
    var pixelData = getBadgePixel(10, 3); // Top line of the R

    return expectedPixelMatcher(pixelData);
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
      var initialPoints = getPoints();

      clickButton();
      clockStub.tick(POMODORO_DURATION);

      var resultingPoints = getPoints();

      expect(resultingPoints).to.equal(initialPoints + 1);
    });

    it("should subtract a point for failed pomodoros", function () {
      givenBadDomain("twitter.com");
      var initialPoints = getPoints();

      clickButton();
      activateTab("http://twitter.com");

      var resultingPoints = getPoints();
      expect(resultingPoints).to.equal(initialPoints - 1);
    });

    it("should do nothing if the pomodoro button is pressed while one's already running", function () {
      var initialPoints = getPoints();

      clickButton();
      clickButton();
      clockStub.tick(POMODORO_DURATION - 1);
      clickButton();
      clockStub.tick(1);

      var resultingPoints = getPoints();
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

        chrome.notifications.onClicked.trigger(NOTIFICATION_ID);

        expect(isPomodoroActive()).to.equal(true);
      });

      it("should let you take a break after your pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
        clockStub.tick(BREAK_DURATION - 1);

        expect(isBreakActive()).to.equal(true);
        expect(chrome.notifications.create.callCount).to.equal(1);
      });

      it("should trigger again after your break is up", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
        clockStub.tick(BREAK_DURATION);

        expect(chrome.notifications.create.callCount).to.equal(2);
        expect(chrome.notifications.create.args[1][1].title).to.equal("Break time's over");
      });

      it("should cancel your break if you start a new pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
        clickButton();
        clockStub.tick(BREAK_DURATION);

        expect(chrome.notifications.create.callCount).to.equal(1);
      });

      it("should let you cancel pomodoro-ing after your pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 1);

        clockStub.tick(1);
        expect(isPomodoroActive()).to.equal(false);
        expect(chrome.notifications.create.callCount).to.equal(1);

        clockStub.tick(BREAK_DURATION);
        expect(isPomodoroActive()).to.equal(false);
        expect(chrome.notifications.create.callCount).to.equal(1);
      });
    });

    describe("OnMessage", function () {
      it("should start a pomodoro when a start message is received", function () {
        chrome.extension.onMessage.trigger({"action": "start-pomodoro"});

        expect(isPomodoroActive()).to.equal(true);
      });

      it("should start a break when a break message is received", function () {
        chrome.extension.onMessage.trigger({"action": "start-break"});

        expect(isBreakActive()).to.equal(true);
        expect(chrome.notifications.create.called).to.equal(false);

        clockStub.tick(BREAK_DURATION);

        expect(chrome.notifications.create.calledOnce).to.equal(true);
        expect(chrome.notifications.create.args[0][1].title).to.equal("Break time's over");
      });
    });

    it("should show a failure page when a pomodoro is failed", function () {
      givenBadDomain("twitter.com");

      clickButton();
      activateTab("http://twitter.com");

      expect(chrome.tabs.executeScript.calledOnce).to.equal(true);
    });

    describe("Progress bar", function () {
      describe("for pomodoros", function () {
        it("should be 0% initially", function () {
          getBadgeImageData();
          // TODO: Work out how to read image data out here to check these
        });

        it("should be 0% after starting a pomodoro");

        it("should be 50% half way through a pomodoro");

        it("should be 99% when a pomodoro is nearly completed");

        it("should be 0% after a pomodoro is completed");

        it("should be 0% if a pomodoro failed half way");
      });

      describe("for breaks", function () {
        it("should be 0% after starting a break");

        it("should be 50% half way through a break");

        it("should be 99% when a break is nearly completed");
      });
    });
  });
})();