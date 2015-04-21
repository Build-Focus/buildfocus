/* global describe, it */

(function () {
  'use strict';

  var clockStub;
  var FailurePageViewModel;

  function resetSpies() {
    chrome.storage.sync.get.yields({});
    chrome.storage.local.get.yields({});
    chrome.notifications.clear.reset();
    chrome.notifications.create.reset();
  }

  describe('Acceptance: Failure page', function () {
    beforeEach(function (done) {
      resetSpies();

      require(["pages/failed-page"], function (loadedClass) {
        clockStub = sinon.useFakeTimers();
        FailurePageViewModel = loadedClass;
        done();
      });
    });

    afterEach(function () {
      clockStub.restore();
    });

    it("should show the user's points", function () {
      chrome.storage.onChanged.trigger({points: {newValue: 10}});

      var viewModel = new FailurePageViewModel();

      expect(viewModel.points()).to.equal(10);
    });
  });
})();