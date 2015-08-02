/* global describe, it */

define(["knockout", "observables/subscribed-observable"], function (ko, SubscribedObservable) {
  'use strict';

  var chromeStub = <typeof SinonChrome> <any> window.chrome;

  describe('Subscribed Observable', function () {
    beforeEach(function () {
      chromeStub.reset();

      chromeStub.storage.local.get.yields({});
      chromeStub.storage.sync.get.yields({});
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
      chromeStub.storage.local.get.yields({"value-name": 1});
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

      chromeStub.storage.onChanged.trigger({"value-name": {"newValue": "updated-value"}});

      expect(observable()).to.equal("updated-value");
    });

    it("uses the sync storage area instead, if requested", function () {
      new SubscribedObservable("sync-value-name", "initial-value", "sync");

      expect(chromeStub.storage.local.get.called).to.equal(false);
      expect(chromeStub.storage.sync.get.called).to.equal(true);
    });
  });
});