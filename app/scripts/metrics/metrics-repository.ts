import _ = require("lodash");
import ko = require("knockout");
import moment = require("moment");

import synchronizedObservable = require('data-synchronization/synchronized-observable');

import QueryableEventStream = require('metrics/queryable-event-stream');

interface RawPomodoroEvent {
  result: PomodoroResult;
  date: string;
}

interface PomodoroEvent {
  result: PomodoroResult;
  date: moment.Moment;
}

function timestamp(event: PomodoroEvent) {
  return event.date.unix();
}

export enum PomodoroResult {
    success,
    failure
}

export class MetricsRepository {
  private rawEvents = ko.pureComputed<PomodoroEvent[]>({
    read: function() {
      return this().map((e) => <PomodoroEvent> _.merge(_.clone(e), { date: moment(e.date) }))
    },
    write: function(newEvents) {
      this(newEvents.map((e) => _.merge(_.clone(e), { date: e.date.toISOString() })));
    }
  }, synchronizedObservable<RawPomodoroEvent[]>("raw-metrics-events", [], "local"));

  private get events(): QueryableEventStream<PomodoroEvent> {
    return new QueryableEventStream(this.rawEvents());
  }

  private recordEvent(newEvent: PomodoroEvent) {
    var events = this.rawEvents();
    var indexForNewEvent = _.sortedIndex(events, newEvent, timestamp);
    events.splice(indexForNewEvent, 0, newEvent);
    this.rawEvents(events);
  }

  recordSuccess(time: moment.Moment) {
    this.recordEvent({ result: PomodoroResult.success, date: time });
  }

  recordFailure(time: moment.Moment) {
    this.recordEvent({ result: PomodoroResult.failure, date: time });
  }

  // Replaces the last successful result with a failure result at the same moment.
  recordRejectedSuccess() {
    var events = this.rawEvents();
    var lastSuccessIndex = _.findLastIndex(events, (e) => e.result === PomodoroResult.success);
    var lastSuccess = events[lastSuccessIndex];
    events[lastSuccessIndex] = { result: PomodoroResult.failure, date: lastSuccess.date };
    this.rawEvents(events);
  }

  get successes(): QueryableEventStream<PomodoroEvent> {
      return this.events.filter((e) => e.result === PomodoroResult.success);
  }

  get failures(): QueryableEventStream<PomodoroEvent> {
      return this.events.filter((e) => e.result === PomodoroResult.failure);
  }
}
