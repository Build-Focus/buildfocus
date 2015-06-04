/* global describe, it */

(function () {
  'use strict';

  var ko;
  var SubscribedObservable;

  describe('Subscribed Observable', function () {
    before(function (done) {
      require(["knockout", "subscribed-observable"], function (loadedKo, loadedClass) {
        SubscribedObservable = loadedClass;
        ko = loadedKo;
        done();
      });
    });

    beforeEach(function () {
      chrome.storage.local.get.reset();
      chrome.storage.sync.get.reset();

      chrome.storage.local.get.yields({});
      chrome.storage.sync.get.yields({});
    });

    it('should be undefined if no stored values are available', function () {
      var observable = new SubscribedObservable("value-name");

      expect(observable()).to.equal(undefined);
    });

    it("should use a given initial value, if provided", function () {
      var observable = new SubscribedObservable("value-name", 0);

      expect(observable()).to.equal(0);
    });

    it("should override the given initial observable value if a saved value is present", function () {
      chrome.storage.local.get.yields({"value-name": 1});
      var observable = new SubscribedObservable("value-name", 0);

      expect(observable()).to.equal(1);
    });

    it('should not allow you to write values', function () {
      var observable = new SubscribedObservable("value-name");

      expect(function () {
        observable("new-value");
      }).to.throw();
    });

    it('should be updated after remote changes to chrome local storage', function () {
      var observable = new SubscribedObservable("value-name", "initial-value");

      chrome.storage.onChanged.trigger({"value-name": {"newValue": "updated-value"}});

      expect(observable()).to.equal("updated-value");
    });

    it("uses the sync storage area instead, if requested", function () {
      new SubscribedObservable("sync-value-name", "initial-value", "sync");

      expect(chrome.storage.local.get.called).to.equal(false);
      expect(chrome.storage.sync.get.called).to.equal(true);
    });
  });
})();