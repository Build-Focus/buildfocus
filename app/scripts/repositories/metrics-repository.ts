import _ = require("lodash");
import ko = require("knockout");
import moment = require("moment");

import synchronizedObservable = require('observables/synchronized-observable');

import QueryableEventStream = require('repositories/queryable-event-stream');

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
    var rawEvents = this.rawEvents();
    var indexForNewEvent = _.sortedIndex(rawEvents, newEvent, timestamp);
    rawEvents.splice(indexForNewEvent, 0, newEvent);
    this.rawEvents(rawEvents);
  }

  recordSuccess(time: moment.Moment) {
    this.recordEvent({ result: PomodoroResult.success, date: time });
  }

  recordFailure(time: moment.Moment) {
    this.recordEvent({ result: PomodoroResult.failure, date: time });
  }

  get successes(): QueryableEventStream<PomodoroEvent> {
      return this.events.filter((e) => e.result === PomodoroResult.success);
  }

  get failures(): QueryableEventStream<PomodoroEvent> {
      return this.events.filter((e) => e.result === PomodoroResult.failure);
  }
}
