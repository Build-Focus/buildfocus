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
      var callbackIndex = badBehaviourCallbacks.indexOf(callback);
      if (callbackIndex > -1) {
        badBehaviourCallbacks = _.reject(badBehaviourCallbacks, function (value, index) {
          return index === callbackIndex;
        });
      } else {
        throw new Error("Attempted to remove bad behaviour callback that wasn't registered");
      }
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