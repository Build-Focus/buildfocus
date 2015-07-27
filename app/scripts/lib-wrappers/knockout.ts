'use strict';

declare module "raw-knockout" {
  import knockout = require("knockout");
  export = knockout
}

define(["raw-knockout", "knockout-es5", "ko-bindings/render-binding"], function (ko) {
  ko.subscribable.fn.subscribeAndUpdate = function (target) {
    target(this());
    return this.subscribe(target);
  };

  return ko;
});

interface KnockoutSubscribable<T> {
  subscribeAndUpdate(callback: (newValue: T) => void): KnockoutSubscription;
}