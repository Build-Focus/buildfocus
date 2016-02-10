'use strict';

declare module "raw-knockout" {
  import knockout = require("knockout");
  export = knockout;
}

define(["lodash", "raw-knockout", "knockout-es5", "ko-bindings/render-binding", "ko-bindings/duration-binding"], function (_, ko) {
  ko.observable.fn.subscribeAndUpdate = function (target) {
    target(this());
    return this.subscribe(target);
  };

  ko.observable.fn.triggerableSubscribe = function (callback, target, event) {
    var subscription = ko.observable.fn.subscribe.apply(this, arguments);

    subscription.trigger = () => callback(this());

    return subscription;
  };

  ko.computed.fn.subscribeAndUpdate = ko.observable.fn.subscribeAndUpdate;
  ko.computed.fn.triggerableSubscribe = ko.observable.fn.triggerableSubscribe;

  loadAllTemplatesFromImports();

  return ko;
});

function loadAllTemplatesFromImports() {
  var imports = document.querySelectorAll('link[rel=import]');
  _.forEach(imports,  (importLink: any) => { // Should be HTMLLinkElement, but that doesn't have .import yet.
    var importedTemplates = importLink.import.querySelectorAll("template");
    _.forEach(importedTemplates, (templateNode) => {
      document.body.appendChild(document.importNode(templateNode, true));
    });
  });
}

interface KnockoutObservable<T> {
  subscribeAndUpdate(callback: (newValue: T) => void): TriggerableKnockoutSubscription;

  triggerableSubscribe(callback: (newValue: T) => void, target?: any, event?: string): TriggerableKnockoutSubscription;
  triggerableSubscribe<TEvent>(callback: (newValue: TEvent) => void, target: any, event: string): TriggerableKnockoutSubscription;
}

interface TriggerableKnockoutSubscription extends KnockoutSubscription {
  trigger(): void;
}