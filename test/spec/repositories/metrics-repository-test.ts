import moment = require("moment");

import {
  metricsEvents,
  setMetricsEvents
} from "test/helpers/saved-state-helper";

import {
  MetricsRepository,
  PomodoroResult
} from "app/scripts/repositories/metrics-repository";

describe("Metrics repository", () => {
  var repo: MetricsRepository;

  beforeEach(() => repo = new MetricsRepository());

  it("should initially have no successes", () => {
    var successesThisCentury = repo.successes.between(moment.yearsAgo(100), moment.tomorrow()).length;
    expect(successesThisCentury).to.equal(0);
  });

  it("should allow querying successes by day", () => {
    repo.recordSuccess(moment.daysAgo(2));
    repo.recordSuccess(moment.yesterday());
    repo.recordSuccess(moment.yesterday());
    repo.recordSuccess(moment.today());

    var successesYesterday = repo.successes.on(moment.yesterday()).length;

    expect(successesYesterday).to.equal(2);
  });

  it("should allow querying successes over time periods", () => {
    repo.recordSuccess(moment.aMonthAgo());
    repo.recordSuccess(moment.aWeekAgo());
    repo.recordSuccess(moment.aWeekAgo());
    repo.recordSuccess(moment.yesterday());
    repo.recordSuccess(moment.today());

    var successes = repo.successes.between(moment.aWeekAgo(), moment.yesterday()).length;

    expect(successes).to.equal(3);
  });

  it("should include dates later in the day", () => {
    repo.recordSuccess(moment.today().hour(23));

    var successesToday = repo.successes.on(moment.today()).length;

    expect(successesToday).to.equal(1);
  });

  it("should not include failures in success totals", () => {
    repo.recordSuccess(moment.yesterday());
    repo.recordSuccess(moment.yesterday());
    repo.recordFailure(moment.yesterday());

    var successesYesterday = repo.successes.on(moment.yesterday()).length;

    expect(successesYesterday).to.equal(2);
  });

  it("should synchronize data to chrome", () => {
    var successMoment = moment.today();
    repo.recordSuccess(successMoment.clone());

    expect(metricsEvents()).to.deep.equal([
      { date: successMoment.toISOString(), result: PomodoroResult.success }
    ]);
  });

  it("should update on chrome data changes", () => {
    setMetricsEvents([
      { date: moment.yesterday().toISOString(), result: PomodoroResult.failure }
    ]);

    var failuresYesterday = repo.failures.on(moment.yesterday()).length;

    expect(failuresYesterday).to.equal(1);
  });
});
