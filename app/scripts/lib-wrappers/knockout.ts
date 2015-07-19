'use strict';

declare module "raw-knockout" {
  import ko = require('knockout');
  export = ko;
}

define(["raw-knockout", "ko-bindings/render-binding"], function (ko) {
  ko.subscribable.fn.subscribeAndUpdate = function (target) {
    target(this());
    return this.subscribe(target);
  };

  return ko;
});

interface KnockoutSubscribable<T> {
  subscribeAndUpdate(callback: (newValue: T) => void): KnockoutSubscription;
}