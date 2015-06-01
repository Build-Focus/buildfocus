/* global describe, it, xit */

(function () {
  'use strict';

  var clockStub;
  var RivetPageViewModel;

  function resetSpies() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
    chrome.tabs.getCurrent.yields({});

    chrome.notifications.clear.reset();
    chrome.notifications.create.reset();
    chrome.extension.sendMessage.reset();
    chrome.tabs.remove.reset();
    chrome.tabs.query.reset();
  }

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

  var setTimeout = window.setTimeout;

  describe('Acceptance: Rivet page', function () {
    beforeEach(function (done) {
      resetSpies();

      require(["pages/rivet-page"], function (loadedClass) {
        clockStub = sinon.useFakeTimers();
        RivetPageViewModel = loadedClass;
        done();
      });
    });

    afterEach(function () {
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

    it("should show the user's points", function () {
      chrome.storage.onChanged.trigger({points: {newValue: 10}});

      var viewModel = new RivetPageViewModel();

      expect(viewModel.points()).to.equal(10);
    });

    it("should let you start anything initially", function () {
      var viewModel = new RivetPageViewModel();

      expect(viewModel.canStartPomodoro()).to.equal(true);
      expect(viewModel.canStartBreak()).to.equal(true);
      expect(viewModel.canSayNotNow()).to.equal(true);
    });

    function shouldCloseTabsIffOtherTabsArePresent(triggerMethodName) {
      it("should close the tab, if other tabs are present", function () {
        chrome.tabs.query.yields([{ id: "this-tab" }, { id: "other-tab" }]);
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chrome.tabs.remove.called).to.equal(true);
      });

      it("should not close the tab if it's the only tab", function () {
        chrome.tabs.query.yields([{ id: "this-tab" }]);
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chrome.tabs.remove.called).to.equal(false);
      });
    }

    function shouldSendMessage(triggerMethodName, messageAction) {
      it("should send a " + messageAction + " message when clicked", function () {
        var viewModel = new RivetPageViewModel();

        viewModel[triggerMethodName]();

        expect(chrome.extension.sendMessage.calledOnce).to.equal(true);
        expect(chrome.extension.sendMessage.calledWith({action: messageAction})).to.equal(true);
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

        chrome.storage.onChanged.trigger({"pomodoro-is-active": {"newValue": true}});

        expect(viewModel.canStartPomodoro()).to.equal(false);
        expect(viewModel.canStartBreak()).to.equal(false);
        expect(viewModel.canSayNotNow()).to.equal(false);
      });
    });

    describe("When a break is active", function () {
      it("should disable the break and not now buttons", function () {
        var viewModel = new RivetPageViewModel();

        chrome.storage.onChanged.trigger({"break-is-active": {"newValue": true}});

        expect(viewModel.canStartPomodoro()).to.equal(true);
        expect(viewModel.canStartBreak()).to.equal(false);
        expect(viewModel.canSayNotNow()).to.equal(false);
      });
    });
  });
})();