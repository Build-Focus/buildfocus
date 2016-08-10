import _ = require("lodash");

import { subscribableEvent, SubscribableEvent2 } from "data-synchronization/subscribable-event";

interface SendResponseCallback {
  (response: any): void;
}

interface MessageEvent<T> {
  (callback: (arg: T, sendResponse?: SendResponseCallback) => void): (arg: T) => void;
  remove(callback: (arg: T) => void): void;
}

interface MessageListener<T> {
  matcher: T;
  listeningEvent: SubscribableEvent2<T, SendResponseCallback>,
}

var messageListeners: any[] = [];

export = function messageEvent<T extends {}>(eventMatcher: T): MessageEvent<T> {
  var newEvent = subscribableEvent<T, SendResponseCallback>();

  messageListeners.push(<MessageListener<T>> {
    matcher: eventMatcher,
    listeningEvent: newEvent,
  });

  return newEvent;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  var result: any = null;

  _.forEach(messageListeners, (messageListener: MessageListener<any>) => {
    if (_.isMatch(message, messageListener.matcher)) {
      messageListener.listeningEvent.trigger(message,
        (response) => result = response);
    }
  });

  if (result !== null) sendResponse(result);
});
