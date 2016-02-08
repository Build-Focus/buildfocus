'use strict';

import indicateFailure = require('app/scripts/failure-notification/failure-indicator');

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub: Sinon.SinonFakeTimers;

function makeUpdatesFail() {
  chromeStub.runtime.lastError = { "message": "No tab with id" };
  chromeStub.tabs.update.yields();
}

function makeUpdatesSucceed() {
  chromeStub.runtime.lastError = undefined;
  chromeStub.tabs.update.yields();
}

function letTabUrlUpdate() {
  chromeStub.runtime.lastError = undefined;
  chromeStub.tabs.get.yields({
    url: '/main.html?failed=true',
    active: true
  });
}

function closeTab() {
  chromeStub.runtime.lastError = { "message": "No tab with id" };
  chromeStub.tabs.get.yields();
}

function dontLetTabUrlUpdate() {
  chromeStub.runtime.lastError = undefined;
  chromeStub.tabs.get.yields({
    url: 'http://facebook.com',
    active: true
  });
}

function showFailureIndicator(tabId = 1, url = "http://twitter.com") {
  indicateFailure(tabId, url);
}

describe("Failure indicator", () => {
  before(() => {
    clockStub = sinon.useFakeTimers();
  });

  after(() => {
    clockStub.restore();
  });

  beforeEach(() => {
    clockStub.reset();
  });

  it("should update tab url immediately", () => {
    makeUpdatesSucceed();
    showFailureIndicator();

    expect(chromeStub.tabs.update.callCount).to.equal(1);
  });

  it("should update the URL of the failing tab", () => {
    makeUpdatesSucceed();
    showFailureIndicator(101, "http://facebook.com");

    expect(chromeStub.tabs.update.args[0][0]).to.equal(101);
    expect(chromeStub.tabs.update.args[0][1].url).to.include("main.html?failed=true&failingUrl=http%3A%2F%2Ffacebook.com");
  });

  it("should stop updating on success", () => {
    makeUpdatesSucceed();

    showFailureIndicator();
    letTabUrlUpdate();
    clockStub.tick(1000);

    expect(chromeStub.tabs.update.callCount).to.equal(1);
    expect(chromeStub.tabs.create.callCount).to.equal(0);
  });

  it("should open failure page in a new tab if the first update fails", () => {
    makeUpdatesFail();

    showFailureIndicator();
    clockStub.tick(250);

    expect(chromeStub.tabs.create.callCount).to.equal(1);
  });

  it("should open failure page in a new tab if update works but URL doesn't stick", () => {
    makeUpdatesSucceed();

    showFailureIndicator();
    dontLetTabUrlUpdate();
    clockStub.tick(250);

    expect(chromeStub.tabs.create.callCount).to.equal(1);
  });

  it("should open failure page in a new tab if update works but tab is already closed", () => {
    makeUpdatesSucceed();

    showFailureIndicator();
    closeTab();
    clockStub.tick(250);

    expect(chromeStub.tabs.create.callCount).to.equal(1);
  });
});