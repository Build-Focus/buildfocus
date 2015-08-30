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
  constructor(private currentTabs: KnockoutObservableArray<Tab>, private settings: SettingsRepository) { }

  currentBadTabs = ko.computed(() => _.filter(this.currentTabs(), (tab) => {
    return _.any(this.settings.badDomains(), (domain) => domain.matches(tab.url));
  }));
}

export = BadBehaviourMonitor