'use strict';

import indicateFailure = require('app/scripts/failure-notification/failure-indicator');

var chromeStub = <typeof SinonChrome> <any> window.chrome;
var clockStub: Sinon.SinonFakeTimers;

function makeExecutionsFail() {
  chromeStub.runtime.lastError = { "message": "ERROR" };
  chromeStub.tabs.executeScript.yields();
}

function makeExecutionsSucceed() {
  chromeStub.runtime.lastError = undefined;
  chromeStub.tabs.executeScript.yields();
}

describe("Failure indicator", () => {
  before(() => {
    clockStub = sinon.useFakeTimers();
  });

  after(() => {
    clockStub.restore();
  });

  beforeEach(() => {
    (<any>clockStub).timers = {};
    chromeStub.reset();
  });

  it("should inject into the tab immediately", () => {
    makeExecutionsSucceed();
    indicateFailure(10);

    expect(chromeStub.tabs.executeScript.callCount).to.equal(1);
    expect(chromeStub.tabs.executeScript.args[0][0]).to.equal(10);
  });

  it("should stop injecting on success", () => {
    makeExecutionsSucceed();
    indicateFailure(10);

    clockStub.tick(1000);

    expect(chromeStub.tabs.executeScript.callCount).to.equal(1);
  });

  it("should try to inject again slightly later if the first injection fails", () => {
    makeExecutionsFail();
    indicateFailure(3);

    clockStub.tick(500);

    expect(chromeStub.tabs.executeScript.callCount).to.be.greaterThan(1);
  });

  it("should keep trying to inject for a while  until injection succeeds", () => {
    makeExecutionsFail();
    indicateFailure(5);

    clockStub.tick(1499);

    expect(chromeStub.tabs.executeScript.callCount).to.be.greaterThan(3);
  });

  it("should stop trying to inject once injection succeeds", () => {
    makeExecutionsFail();
    indicateFailure(5);

    makeExecutionsSucceed();
    clockStub.tick(1499);

    expect(chromeStub.tabs.executeScript.callCount).to.equal(2);
  });

  it("should eventually give up and open a new failure tab", () => {
    makeExecutionsFail();
    indicateFailure(7);

    clockStub.tick(1500);
    var countAfter2Seconds = chromeStub.tabs.executeScript.callCount;
    clockStub.tick(8500);
    var countAfter10Seconds = chromeStub.tabs.executeScript.callCount;

    expect(countAfter2Seconds).to.equal(countAfter10Seconds);
    expect(chromeStub.tabs.create.callCount).to.equal(1);
  });
});