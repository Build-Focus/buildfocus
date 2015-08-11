'use strict';

import ko = require("knockout");
import synchronizedObservable = require("app/scripts/observables/synchronized-observable");

var chromeStub = <typeof SinonChrome> <any> window.chrome;

describe('Synchronized Observable', function () {
  beforeEach(function () {
    chromeStub.reset();
  });

  it('should be undefined if no stored values are available', function () {
    var observable = synchronizedObservable("value-name");

    expect(observable()).to.equal(undefined);
  });

  it("should use a given initial value, if provided", function () {
    var observable = synchronizedObservable("value-name", 0);

    expect(observable()).to.equal(0);
  });

  it("should override the given initial observable value if a saved value is present", function () {
    chromeStub.storage.local.get.yields({"value-name": 1});
    var observable = synchronizedObservable("value-name", 0);

    expect(observable()).to.equal(1);
  });

  it('should store values and let you read them back', function () {
    var observable = synchronizedObservable("value-name");

    observable("new-value");

    expect(observable()).to.equal("new-value");
  });

  it('should persist values to chrome local storage', function () {
    var observable = synchronizedObservable("value-name");

    observable("new-value");

    expect(chromeStub.storage.local.set.calledOnce).to.equal(true);
    expect(chromeStub.storage.local.set.args[0][0]["value-name"]).to.equal("new-value");
  });

  it('should be updated after remote changes to chrome local storage', function () {
    var observable = synchronizedObservable("value-name");

    observable("initial-value");
    chromeStub.storage.onChanged.trigger({"value-name": {"newValue": "updated-value"}});

    expect(observable()).to.equal("updated-value");
  });

  it("uses the sync storage area instead, if requested", function () {
    var observable = synchronizedObservable("sync-value-name", "old-value", "sync");

    observable("new-value");

    expect(chromeStub.storage.sync.set.calledOnce).to.equal(true);
    expect(chromeStub.storage.sync.set.args[0][0]["sync-value-name"]).to.equal("new-value");
  });
});