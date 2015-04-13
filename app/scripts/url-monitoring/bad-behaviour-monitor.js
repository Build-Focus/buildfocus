'use strict';

define(["knockout", "lodash"], function (ko, _) {
  return function BadBehaviourMonitor(currentUrls, settings) {
    var currentlyOnBadDomain = ko.computed(function () {
      return _.any(currentUrls(), function (url) {
        return _.any(settings.badDomains(), function (domain) {
          return domain.matches(url);
        });
      });
    });

    var badBehaviourCallbacks = [];
    this.onBadBehaviour = function(callback) {
      badBehaviourCallbacks.push(callback);
      return callback; // for later deregistration
    };
    this.removeBadBehaviourCallback = function(callback) {
      badBehaviourCallbacks = _.reject(badBehaviourCallbacks, callback);
    };

    currentlyOnBadDomain.subscribe(function () {
      if (currentlyOnBadDomain()) {
        _.forEach(badBehaviourCallbacks, function (callback) {
          callback();
        });
      }
    });
  };
});