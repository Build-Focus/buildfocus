import moment = require("moment");
import QueryableEventStream = require("app/scripts/metrics/queryable-event-stream");

interface Event {
  date: moment.Moment
}

describe("A queryable event stream", () => {
  it("should be empty if it contains no items", () => {
    var stream = new QueryableEventStream([]);
    expect(stream.length).to.equal(0);
  });

  it("should be filterable", () => {
    var stream = new QueryableEventStream([
      { name: "Bob", date: moment.yesterday() },
      { name: "Fran", date: moment.today() },
      { name: "Bill", date: moment.tomorrow() }
    ]);

    var theBs = stream.filter((e) => _.startsWith(e.name, "B"));
    var theFs = stream.filter((e) => _.startsWith(e.name, "F"));

    expect(theBs.length).to.equal(2);
    expect(theFs.length).to.equal(1);
  });

  it("should allow repeated filtering", () => {
    var stream = new QueryableEventStream([
      { name: "Bob", date: moment.yesterday() },
      { name: "Fran", date: moment.today() },
      { name: "Bill", date: moment.tomorrow() }
    ]);

    var theBs = stream.filter((e) => _.startsWith(e.name, "B"));
    var theBsWithFourLetters = theBs.filter((e) => e.name.length === 4);

    expect(theBsWithFourLetters.length).to.equal(1);
  })

  it("should allow querying by day", () => {
    var stream = new QueryableEventStream([
      { date: moment.daysAgo(2) },
      { date: moment.yesterday() },
      { date: moment.yesterday() },
      { date: moment.today() }
    ]);

    var eventsYesterday = stream.on(moment.yesterday()).length;

    expect(eventsYesterday).to.equal(2);
  });

  it("should allow querying over time ranges", () => {
    var stream = new QueryableEventStream([
      { date: moment.aMonthAgo() },
      { date: moment.aWeekAgo() },
      { date: moment.aWeekAgo() },
      { date: moment.yesterday() },
      { date: moment.today() }
    ]);

    var eventsLastWeek = stream.between(moment.aWeekAgo(), moment.yesterday()).length;

    expect(eventsLastWeek).to.equal(3);
  });

  it("should include dates later in the day", () => {
    var stream = new QueryableEventStream([
      { date: moment.today().hour(23) }
    ]);

    var eventsToday = stream.on(moment.today()).length;

    expect(eventsToday).to.equal(1);
  });
});
