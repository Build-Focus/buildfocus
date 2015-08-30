'use strict';

import ko = require("knockout");
import _ = require("lodash");
import SubscribableEvent = require("subscribable-event");
import SettingsRepository = require('repositories/settings-repository');

interface Tab {
  id: number;
  url?: string;
}

class BadBehaviourMonitor {
  public onBadBehaviour = SubscribableEvent<number, string>();

  constructor(currentTabs: KnockoutObservableArray<Tab>, settings: SettingsRepository) {
    var currentBadTabs = ko.computed(function () {
      return _.filter(currentTabs(), (tab) => _.any(settings.badDomains(), (domain) => domain.matches(tab.url)));
    });

    currentBadTabs.subscribe(() => {
      currentBadTabs().forEach((tab) => this.onBadBehaviour.trigger(tab.id, tab.url));
    });
  }
}

export = BadBehaviourMonitor