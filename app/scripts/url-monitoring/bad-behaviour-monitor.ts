'use strict';

import ko = require("knockout");
import _ = require("lodash");
import SubscribableEvent = require("subscribable-event");
import SettingsRepository = require('repositories/settings-repository');

class BadBehaviourMonitor {
  public onBadBehaviour = SubscribableEvent();

  constructor(currentUrls: KnockoutObservableArray<string>, settings: SettingsRepository) {
    var currentlyOnBadDomain = ko.computed(function () {
      return _.any(currentUrls(), function (url) {
        return _.any(settings.badDomains(), function (domain) {
          return domain.matches(url);
        });
      });
    });

    currentlyOnBadDomain.subscribe(() => {
      if (currentlyOnBadDomain()) {
        this.onBadBehaviour.trigger();
      }
    });
  }
};

export = BadBehaviourMonitor