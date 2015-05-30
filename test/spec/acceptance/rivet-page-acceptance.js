/* global describe, it, xit */

(function () {
  'use strict';

  var clockStub;
  var RivetPageViewModel;

  function resetSpies() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
    chrome.notifications.clear.reset();
    chrome.notifications.create.reset();
    chrome.extension.sendMessage.reset();
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

    it("should send a start-pomodoro message when start is clicked", function () {
      var viewModel = new RivetPageViewModel();

      viewModel.startPomodoro();

      expect(chrome.extension.sendMessage.calledOnce).to.equal(true);
    });

    it("should send a start-break message when take a break is clicked", function () {
      var viewModel = new RivetPageViewModel();

      viewModel.startBreak();

      expect(chrome.extension.sendMessage.calledOnce).to.equal(true);
    });
  });
})();