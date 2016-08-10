import moment = require("moment");

import NotificationHelper = require("test/helpers/notification-test-helper");
import { activateTab, resetTabHelper } from "test/helpers/tab-helper";
import { givenBadDomains, distributeMetricsData } from "test/helpers/saved-state-helper";
import { startPomodoro } from "test/helpers/messaging-helper";
import { MetricsRepository } from "app/scripts/metrics/metrics-repository";

const POMODORO_DURATION = 1000 * 60 * 25;

var clockStub: Sinon.SinonFakeTimers;
var chromeStub = <typeof SinonChrome> <any> window.chrome;
var notificationHelper = new NotificationHelper(() => clockStub);

async function completePomodoro() {
  await startPomodoro();
  clockStub.tick(POMODORO_DURATION);
  distributeMetricsData();
}

async function failPomodoro() {
  givenBadDomains("twitter.com");
  await startPomodoro();
  activateTab("http://twitter.com");
  distributeMetricsData();
}

function rejectSuccessfulPomodoro() {
  notificationHelper.clickIGotDistracted();
  notificationHelper.clickConfirmIGotDistracted();
  distributeMetricsData();
}

// TODO: Lots of time based tests here that might fail if you run these tests
// at *exactly* midnight. Probably just going to ignore for now.

// This test needs to run before any of the tests which reset the world.
// Or the tests need to stop resetting the world. That doesn't work, because
// we need to cut off subscriptions to things like notification clicks.

// Need to ensure this test is run early. Or need to isolate acceptance tests
// in a totally different browser context. Or reset the SUT.

describe("Acceptance: Metrics", () => {
  var metrics = new MetricsRepository();
  var initialSuccesses: number;
  var initialFailures: number;

  function successesToday() {
    return metrics.successes.on(moment.today()).length;
  }

  function failuresToday() {
    return metrics.failures.on(moment.today()).length;
  }

  before(() => clockStub = sinon.useFakeTimers());
  after(() => clockStub.restore());

  beforeEach(() => {
    resetTabHelper();
    distributeMetricsData();

    initialFailures = failuresToday();
    initialSuccesses = successesToday();
  });

  afterEach(() => {
    // Make sure any active pomodoros are definitely finished
    clockStub.tick(POMODORO_DURATION);
    clockStub.reset();
  });

  it("should add successful pomodoros to today's successes", async () => {
    await completePomodoro();

    expect(successesToday()).to.equal(initialSuccesses + 1);
  });

  it("should not add failed pomodoros to today's successes", async () => {
    await failPomodoro();

    expect(successesToday()).to.equal(initialSuccesses);
  });

  it("should add failed pomodoros to today's failures", async () => {
    await failPomodoro();

    expect(failuresToday()).to.equal(initialFailures + 1);
  });

  it("should add rejected successful pomodoros to today's failures", async () => {
    await completePomodoro();

    rejectSuccessfulPomodoro();

    expect(successesToday()).to.equal(initialSuccesses);
    expect(failuresToday()).to.equal(initialFailures + 1);
  });

  it("should not include today's today in past metrics", async () => {
    var initialFailuresBeforeToday = metrics.failures.between(moment.aYearAgo(), moment.yesterday()).length;
    await failPomodoro();

    var failuresBeforeToday = metrics.failures.between(moment.aYearAgo(), moment.yesterday()).length;
    expect(failuresBeforeToday).to.equal(initialFailuresBeforeToday);
  });
});
