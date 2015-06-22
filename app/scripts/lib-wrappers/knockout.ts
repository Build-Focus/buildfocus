'use strict';

define(["raw-knockout"], function (ko) {
  ko.subscribable.fn.subscribeAndUpdate = function (target) {
    target(this());
    return this.subscribe(target);
  };

  return ko;
});