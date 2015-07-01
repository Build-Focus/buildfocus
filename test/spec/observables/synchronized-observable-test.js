/* global describe, it */

(function () {
  'use strict';

  var ko;
  var SynchronizedObservable;

  describe('Synchronized Observable', function () {
    before(function (done) {
      require(["knockout", "observables/synchronized-observable"], function (loadedKo, loadedClass) {
        SynchronizedObservable = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    beforeEach(function () {
      chrome.storage.local.set.reset();
      chrome.storage.local.get.yields({});
    });

    it('should be undefined if no stored values are available', function () {
      var observable = new SynchronizedObservable("value-name");

      expect(observable()).to.equal(undefined);
    });

    it("should use a given initial value, if provided", function () {
      var observable = new SynchronizedObservable("value-name", 0);

      expect(observable()).to.equal(0);
    });

    it("should override the given initial observable value if a saved value is present", function () {
      chrome.storage.local.get.yields({"value-name": 1});
      var observable = new SynchronizedObservable("value-name", 0);

      expect(observable()).to.equal(1);
    });

    it('should store values and let you read them back', function () {
      var observable = new SynchronizedObservable("value-name");

      observable("new-value");

      expect(observable()).to.equal("new-value");
    });

    it('should persist values to chrome local storage', function () {
      var observable = new SynchronizedObservable("value-name");

      observable("new-value");

      expect(chrome.storage.local.set.calledOnce).to.equal(true);
      expect(chrome.storage.local.set.args[0][0]["value-name"]).to.equal("new-value");
    });

    it('should be updated after remote changes to chrome local storage', function () {
      var observable = new SynchronizedObservable("value-name");

      observable("initial-value");
      chrome.storage.onChanged.trigger({"value-name": {"newValue": "updated-value"}});

      expect(observable()).to.equal("updated-value");
    });

    it("uses the sync storage area instead, if requested", function () {
      var observable = new SynchronizedObservable("sync-value-name", 0, "sync");

      observable("new-value");

      expect(chrome.storage.sync.set.calledOnce).to.equal(true);
      expect(chrome.storage.sync.set.args[0][0]["sync-value-name"]).to.equal("new-value");
    });
  });
})();