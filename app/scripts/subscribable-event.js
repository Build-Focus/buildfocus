'use strict';

define(["lodash"], function (_) {
  return function SubscribableEvent() {
    var callbacks = [];

    var eventSubscribeFunction = function (callback) {
      callbacks.push(callback);
      return callback;
    };

    eventSubscribeFunction.trigger = function () {
      _.forEach(callbacks, function (callback) { callback(); });
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

    return eventSubscribeFunction;
  };
});