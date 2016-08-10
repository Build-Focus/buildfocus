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

interface SubscriptionToken {
  (...args: any[]): void;
}

export interface SubscribableEvent {
  (callback: Callback): SubscriptionToken;
  trigger: () => void;
  remove(callback: SubscriptionToken): void;
}

export interface SubscribableEvent1<T> {
  (callback: Callback1<T>): SubscriptionToken;
  trigger: (arg: T) => void;
  remove(callback: SubscriptionToken): void;
}

export interface SubscribableEvent2<T1, T2> {
  (callback: Callback2<T1, T2>): SubscriptionToken;
  trigger: (arg1: T1, arg2: T2) => void;
  remove(callback: SubscriptionToken): void;
}

function SubscribableEventConstructor(): SubscribableEvent;
function SubscribableEventConstructor<T>(): SubscribableEvent1<T>;
function SubscribableEventConstructor<T1, T2>(): SubscribableEvent2<T1, T2>;

function SubscribableEventConstructor(): SubscribableEvent {
  var callbacks: Array<(...args: any[]) => void> = [];

  return <SubscribableEvent> _.merge(function (callback: Callback): SubscriptionToken {
    callbacks.push(callback);
    return callback;
  }, {
    trigger: function (...args: any[]) {
      _.forEach(callbacks, function (callback) { callback.apply(null, args); });
    },
    remove: function (subscriptionToken: SubscriptionToken) {
      var callbackIndex = callbacks.indexOf(subscriptionToken);
      if (callbackIndex > -1) {
        callbacks = _.reject(callbacks, function (value, index) {
          return index === callbackIndex;
        });
      } else {
        throw new Error("Attempted to remove callback that wasn't registered");
      }
    }
  });
}

export { SubscribableEventConstructor as subscribableEvent };
