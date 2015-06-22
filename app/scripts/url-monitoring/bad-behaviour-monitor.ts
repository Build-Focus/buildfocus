'use strict';

define(["knockout", "lodash", "subscribable-event"], function (ko, _, SubscribableEvent) {
  return function BadBehaviourMonitor(currentUrls, settings) {
    var self = this;

    var currentlyOnBadDomain = ko.computed(function () {
      return _.any(currentUrls(), function (url) {
        return _.any(settings.badDomains(), function (domain) {
          return domain.matches(url);
        });
      });
    });

    self.onBadBehaviour = new SubscribableEvent();

    currentlyOnBadDomain.subscribe(function () {
      if (currentlyOnBadDomain()) {
        self.onBadBehaviour.trigger();
      }
    });
  };
});