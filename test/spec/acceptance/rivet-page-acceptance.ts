/* global describe, it, xit */

define(["pages/rivet-page", "city/city"], function (RivetPageViewModel, City) {
  'use strict';

  var chromeStub = <typeof SinonChrome> <any> window.chrome;

  function openPageWithScript(scriptUrl) {
    var iframe = document.createElement("iframe");
    iframe.src = "about:blank";

    document.body.appendChild(iframe);

    iframe.contentWindow.document.open('text/html', 'replace');
    iframe.contentWindow.document.write(
      "<html>" +
      "<script src='bower_components/sinonjs/sinon.js'></script>" +
      "<script src='bower_components/sinon-chrome/src/chrome-alarms.js'></script>" +
      "<script src='bower_components/sinon-chrome/src/chrome-event.js'></script>" +
      "<script src='bower_components/sinon-chrome/src/chrome.js'></script>" +
      "<script>chrome.extension.getURL.returnsArg(0);</script>" +
      "<script src='" + scriptUrl + "'></script>" +
      "</html>"
    );
    iframe.contentWindow.document.close();

    return iframe.contentWindow;
  }

  var clockStub;
  var setTimeout = window.setTimeout;

  describe('Acceptance: Rivet page', function () {
    before(function () {
      clockStub = sinon.useFakeTimers();
    });

    beforeEach(function () {
      chromeStub.reset();

      chromeStub.storage.sync.get.yields({});
      chromeStub.storage.local.get.yields({});
      chromeStub.tabs.getCurrent.yields({});
    });

    after(function () {
      clockStub.restore();
    });

    // TODO: Find a useful way to test and thus reenable this
    xit("should be loaded when the failure script is injected", function (done) {
      var page = openPageWithScript("scripts/failure-content-script.js");

      setTimeout(function () {
        expect(page.location.pathname).to.equal("/rivet.html");
        done();
      }, 500);
    });

    describe("city", function () {
      it("should be empty initially", function () {
        var viewModel = new RivetPageViewModel();

        var renderedOutput = viewModel.renderCity();

        // Just one empty cell
        expect(renderedOutput().length).to.equal(1);
      });

      it("should load from persisted data", function () {
        var city = new City();
        city.construct(city.getPossibleUpgrades()[0]);

        var viewModel = new RivetPageViewModel();
        chromeStub.storage.sync.get.yield({ "city-data": city.toJSON() });
        var renderedOutput = viewModel.renderCity();

        // Nine cells + one building
        expect(renderedOutput().length).to.equal(10);
      });

      it("should update the city when it's updated remotely", function () {
        var cityWithNewBuilding = new City();
        cityWithNewBuilding.construct(cityWithNewBuilding.getPossibleUpgrades()[0]);

        var viewModel = new RivetPageViewModel();
        chromeStub.storage.onChanged.trigger(
          { "city-data": { "newValue": cityWithNewBuilding.toJSON() } }
        );
        var renderedOutput = viewModel.renderCity();

        // Nine cells + one building
        expect(renderedOutput().length).to.equal(10);
      });
    });

    it("should let you start anything initially", function () {
      var viewModel = new RivetPageViewModel();

      expect(viewModel.canStartPomodoro()).to.equal(true);
      expect(viewModel.canStartBreak()).to.equal(true);
      expect(viewModel.canSayNotNow()).to.equal(true);
    });

    function shouldCloseTabsIffOtherTabsArePresent(triggerMethodName) {
      it("should close the tab, if other tabs are present", function () {
        chromeStub.tabs.query.yields([{ id: "this-tab" }, { id: "other-tab" }]);
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chromeStub.tabs.remove.called).to.equal(true);
      });

      it("should not close the tab if it's the only tab", function () {
        chromeStub.tabs.query.yields([{ id: "this-tab" }]);
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chromeStub.tabs.remove.called).to.equal(false);
      });
    }

    function shouldSendMessage(triggerMethodName, messageAction) {
      it("should send a " + messageAction + " message when clicked", function () {
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chromeStub.runtime.sendMessage.calledOnce).to.equal(true);
        expect(chromeStub.runtime.sendMessage.calledWith({action: messageAction})).to.equal(true);
      });
    }

    describe("When start pomodoro is pressed", function () {
      shouldSendMessage('startPomodoro', 'start-pomodoro');
      shouldCloseTabsIffOtherTabsArePresent('startPomodoro');
    });

    describe("When take a break is pressed", function () {
      shouldSendMessage('startBreak', 'start-break');
      shouldCloseTabsIffOtherTabsArePresent('startBreak');
    });

    describe("When a pomodoro is active", function () {
      it("should disable all buttons", function () {
        var viewModel = new RivetPageViewModel();

        chromeStub.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});

        expect(viewModel.canStartPomodoro()).to.equal(false);
        expect(viewModel.canStartBreak()).to.equal(false);
        expect(viewModel.canSayNotNow()).to.equal(false);
      });
    });

    describe("When a break is active", function () {
      it("should disable the break and not now buttons", function () {
        var viewModel = new RivetPageViewModel();

        chromeStub.storage.onChanged.trigger({"break-is-active": {"newValue": true}});

        expect(viewModel.canStartPomodoro()).to.equal(true);
        expect(viewModel.canStartBreak()).to.equal(false);
        expect(viewModel.canSayNotNow()).to.equal(false);
      });
    });
  });
});