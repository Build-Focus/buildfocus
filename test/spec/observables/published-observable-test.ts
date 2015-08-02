/* global describe, it */

define(["knockout", "observables/published-observable"], function (ko, PublishedObservable) {
  'use strict';

  var chromeStub = <typeof SinonChrome> <any> window.chrome;

  describe('Published Observable', function () {
    beforeEach(function () {
      chromeStub.reset();
    });

    it('should use the value of the observable initially', function () {
      var observable = ko.observable(1);
      var publishedObservable = new PublishedObservable("value-name", observable);

      expect(publishedObservable()).to.equal(1);
    });

    it('should send an update initially', function () {
      var observable = ko.observable(5);
      new PublishedObservable("value-name", observable);

      expect(chromeStub.storage.local.set.calledOnce).to.equal(true);
      expect(chromeStub.storage.local.set.args[0][0]["value-name"]).to.equal(5);
    });

    it('should publish direct updates', function () {
      var publishedObservable = new PublishedObservable("value-name", ko.observable());

      publishedObservable("new-value");

      expect(chromeStub.storage.local.set.called).to.equal(true);
      expect(chromeStub.storage.local.set.args[1][0]["value-name"]).to.equal("new-value");
    });

    it('should publish updates to the wrapped observable', function () {
      var observable = ko.observable();
      new PublishedObservable("value-name", observable);

      observable("new-value");

      expect(chromeStub.storage.local.set.called).to.equal(true);
      expect(chromeStub.storage.local.set.args[1][0]["value-name"]).to.equal("new-value");
    });

    it("uses the sync storage area instead, if requested", function () {
      var observable = ko.observable();
      new PublishedObservable("value-name", observable, "sync");

      observable("new-value");

      expect(chromeStub.storage.local.set.called).to.equal(false);
      expect(chromeStub.storage.sync.set.called).to.equal(true);
    });
  });
});