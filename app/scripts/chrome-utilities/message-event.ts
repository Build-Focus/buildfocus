import _ = require("lodash");

import { subscribableEvent, SubscribableEvent1 } from "subscribable-event";

interface NonTriggerableEvent<T> {
  (callback: (arg: T) => void): (arg: T) => void;
  remove(callback: (arg: T) => void): void;
}

interface EventAndMatcher<T> {
    matcher: T;
    event: SubscribableEvent1<T>
}

var messageEvents: any[] = [];

export = function messageEvent<T extends {}>(eventMatcher: T): NonTriggerableEvent<T> {
    var newEvent = subscribableEvent<T>();
    messageEvents.push({ matcher: eventMatcher, event: newEvent });
    return newEvent;
}

chrome.runtime.onMessage.addListener((message) => {
    _.forEach(messageEvents, (eventAndMatcher) => {
        if (_.isMatch(message, eventAndMatcher.matcher)) {
            eventAndMatcher.event.trigger(message);
        }
    });
});
