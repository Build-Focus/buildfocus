import _ = require("lodash");
import moment = require("moment");

class QueryableEventStream<T extends { date: moment.Moment }> {
  constructor(private items: T[]) { }

  filter(matcher: (item: T) => boolean): QueryableEventStream<T> {
    return new QueryableEventStream(this.items.filter(matcher));
  }

  on(date: moment.Moment): QueryableEventStream<T> {
    var startTime = date.clone().startOf("day");
    var endTime = date.clone().endOf("day");

    return this.between(startTime, endTime);
  }

  between(startTime: moment.Moment, endTime: moment.Moment): QueryableEventStream<T> {
    var startIndex = _.findIndex(this.items, (item) => item.date.isSameOrAfter(startTime));
    var endIndex = _.findLastIndex(this.items, (item) => item.date.isSameOrBefore(endTime));

    // If there are no elements that are after the start, or none that are before the end, nothing matches.
    if (startIndex === -1 || endIndex === -1) return new QueryableEventStream([]);

    return new QueryableEventStream(this.items.slice(startIndex, endIndex+1));
  }

  get length(): number {
    return this.items.length;
  }
}

export = QueryableEventStream;
