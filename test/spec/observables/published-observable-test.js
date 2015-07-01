/* global describe, it */

(function () {
  'use strict';

  var ko;
  var PublishedObservable;

  describe('Published Observable', function () {
    before(function (done) {
      require(["knockout", "observables/published-observable"], function (loadedKo, loadedClass) {
        PublishedObservable = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    beforeEach(function () {
      chrome.storage.local.set.reset();
      chrome.storage.sync.set.reset();
    });

    it('should use the value of the observable initially', function () {
      var observable = ko.observable(1);
      var publishedObservable = new PublishedObservable("value-name", observable);

      expect(publishedObservable()).to.equal(1);
    });

    it('should send an update initially', function () {
      var observable = ko.observable(5);
      new PublishedObservable("value-name", observable);

      expect(chrome.storage.local.set.calledOnce).to.equal(true);
      expect(chrome.storage.local.set.args[0][0]["value-name"]).to.equal(5);
    });

    it('should publish direct updates', function () {
      var publishedObservable = new PublishedObservable("value-name", ko.observable());

      publishedObservable("new-value");

      expect(chrome.storage.local.set.called).to.equal(true);
      expect(chrome.storage.local.set.args[1][0]["value-name"]).to.equal("new-value");
    });

    it('should publish updates to the wrapped observable', function () {
      var observable = ko.observable();
      new PublishedObservable("value-name", observable);

      observable("new-value");

      expect(chrome.storage.local.set.called).to.equal(true);
      expect(chrome.storage.local.set.args[1][0]["value-name"]).to.equal("new-value");
    });

    it("uses the sync storage area instead, if requested", function () {
      var observable = ko.observable();
      new PublishedObservable("value-name", observable, "sync");

      observable("new-value");

      expect(chrome.storage.local.set.called).to.equal(false);
      expect(chrome.storage.sync.set.called).to.equal(true);
    });
  });
})();