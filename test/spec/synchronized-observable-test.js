/* global describe, it */

(function () {
  'use strict';

  var SynchronizedObservable;

  describe('Synchronized Observable', function () {
    before(function (done) {
      require(["synchronized-observable"], function (loadedClass) {
        SynchronizedObservable= loadedClass;
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
  });
})();