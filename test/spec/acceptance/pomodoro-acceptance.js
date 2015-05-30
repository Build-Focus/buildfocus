/* global describe, it, _ */

(function () {
  'use strict';

  var POMODORO_DURATION = 1000 * 60 * 20;
  var BREAK_DURATION = 1000 * 60 * 5;
  var NOTIFICATION_ID = "rivet-pomodoro-notification";

  var clockStub;

  function exceptInPhantom(block) {
    if (!window.PHANTOMJS) {
      block();
    }
  }

  function setupStorageStubs() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
  }

  function resetSpies() {
    clockStub.timers = {};

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

  function badgeIconColour() {
    return getBadgePixel(10, 3); // Top line of the R
  }

  var POMODORO_COLOUR = [224, 5, 5];
  var BREAK_COLOUR = [34, 187, 4];
  var BADGE_BACKGROUND_COLOUR = [251, 189, 72];
  var BADGE_R_COLOUR = [53, 40, 26];

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

        expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
      });

      it("should let you take a break after your pomodoro", function () {
        clickButton();
        clockStub.tick(POMODORO_DURATION);

        chrome.notifications.onButtonClicked.trigger(NOTIFICATION_ID, 0);
        clockStub.tick(BREAK_DURATION - 1);

        expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
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
        expect(badgeIconColour()).to.be.rgbPixel(BADGE_R_COLOUR);
        expect(chrome.notifications.create.callCount).to.equal(1);

        clockStub.tick(BREAK_DURATION);
        expect(badgeIconColour()).to.be.rgbPixel(BADGE_R_COLOUR);
        expect(chrome.notifications.create.callCount).to.equal(1);
      });
    });

    describe("OnMessage", function () {
      it("should start a pomodoro when a start message is received", function () {
        chrome.extension.onMessage.trigger({"action": "start-pomodoro"});

        expect(badgeIconColour()).to.be.rgbPixel(POMODORO_COLOUR);
      });

      it("should start a break when a break message is received", function () {
        chrome.extension.onMessage.trigger({"action": "start-break"});

        expect(badgeIconColour()).to.be.rgbPixel(BREAK_COLOUR);
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

    // PhantomJS doesn't support setLineDash (until 2.0 is stable), so none of these
    // will pass. They should all pass in Chrome though.
    exceptInPhantom(function () {
      describe("Progress bar", function () {
        describe("for pomodoros", function () {
          it("shouldn't be shown initially", function () {
            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
          });

          it("should be 0% after starting a pomodoro", function () {
            clickButton();

            expect(getBadgePixel(0, 0)).to.be.transparent();
          });

          it("should be 50% half way through a pomodoro", function () {
            clickButton();
            clockStub.tick(POMODORO_DURATION / 2);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
            expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
            expect(getBadgePixel(0, 18)).to.be.transparent();
          });

          it("should be 99% when a pomodoro is nearly completed", function () {
            clickButton();
            clockStub.tick(POMODORO_DURATION - 1);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(POMODORO_COLOUR);
            expect(getBadgePixel(18, 18)).to.be.rgbPixel(POMODORO_COLOUR);
            expect(getBadgePixel(0, 18)).to.be.rgbPixel(POMODORO_COLOUR);
            expect(getBadgePixel(0, 5)).to.be.rgbPixel(POMODORO_COLOUR);
          });

          it("shouldn't be shown after a pomodoro is completed", function () {
            clickButton();
            clockStub.tick(POMODORO_DURATION);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
          });

          it("shouldn't be shown after a pomodoro is failed", function () {
            givenBadDomain("twitter.com");

            clickButton();
            clockStub.tick(POMODORO_DURATION / 2);
            activateTab("http://twitter.com");

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
          });
        });

        describe("for breaks", function () {
          it("should be 0% after starting a break", function () {
            chrome.extension.onMessage.trigger({"action": "start-break"});
            expect(getBadgePixel(0, 0)).to.be.transparent();
          });

          it("should be 50% half way through a break", function () {
            chrome.extension.onMessage.trigger({"action": "start-break"});
            clockStub.tick(BREAK_DURATION / 2);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
            expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
            expect(getBadgePixel(0, 18)).to.be.transparent();
          });

          it("should be 99% when a break is nearly completed", function () {
            chrome.extension.onMessage.trigger({"action": "start-break"});
            clockStub.tick(BREAK_DURATION - 1);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BREAK_COLOUR);
            expect(getBadgePixel(18, 18)).to.be.rgbPixel(BREAK_COLOUR);
            expect(getBadgePixel(0, 18)).to.be.rgbPixel(BREAK_COLOUR);
            expect(getBadgePixel(0, 5)).to.be.rgbPixel(BREAK_COLOUR);
          });

          it("shouldn't be shown after a break is completed", function () {
            chrome.extension.onMessage.trigger({"action": "start-break"});
            clockStub.tick(BREAK_DURATION);

            expect(getBadgePixel(0, 0)).to.be.rgbPixel(BADGE_BACKGROUND_COLOUR);
          });
        });
      });
    });
  });
})();