import _ = require('lodash');

interface Callback {
  (): void
}

interface Callback1<T> {
  (arg: T): void
}

interface Callback2<T1, T2> {
  (arg1: T1, arg2: T2): void
}

interface SubscribableEvent {
  (callback: Callback): Callback;
  trigger: () => void;
  remove(callback: Callback): void;
}

interface SubscribableEvent1<T> {
  (callback: Callback1<T>): Callback1<T>;
  trigger: (arg: T) => void;
  remove(callback: Callback1<T>): void;
}

interface SubscribableEvent2<T1, T2> {
  (callback: Callback2<T1, T2>): Callback2<T1, T2>;
  trigger: (arg1: T1, arg2: T2) => void;
  remove(callback: Callback2<T1, T2>): void;
}

function SubscribableEventConstructor(): SubscribableEvent;
function SubscribableEventConstructor<T>(): SubscribableEvent1<T>;
function SubscribableEventConstructor<T1, T2>(): SubscribableEvent2<T1, T2>;

function SubscribableEventConstructor(): SubscribableEvent {
  var callbacks: Array<(...args: any[]) => void> = [];

  var eventSubscribeFunction = <SubscribableEvent> function (callback) {
    callbacks.push(callback);
    return callback;
  };

  eventSubscribeFunction.trigger = function (...args: any[]) {
    _.forEach(callbacks, function (callback) { callback.apply(null, args); });
  };

  eventSubscribeFunction.remove = function (callback) {
    var callbackIndex = callbacks.indexOf(callback);
    if (callbackIndex > -1) {
      callbacks = _.reject(callbacks, function (value, index) {
        return index === callbackIndex;
      });
    } else {
      throw new Error("Attempted to remove callback that wasn't registered");
    }
  };

  return <SubscribableEvent> eventSubscribeFunction;
}

export = SubscribableEventConstructor;