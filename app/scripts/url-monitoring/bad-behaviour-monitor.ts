'use strict';

import ko = require("knockout");
import _ = require("lodash");
import { subscribableEvent } from "data-synchronization/subscribable-event";
import SettingsRepository = require('settings-repository');
import Tab = require('url-monitoring/tab');

class BadBehaviourMonitor {
  constructor(private currentTabs: KnockoutObservableArray<Tab>, private settings: SettingsRepository) { }

  currentBadTabs = ko.computed(() => _.filter(this.currentTabs(), (tab) => {
    return _.any(this.settings.badDomains(), (domain) => domain.matches(tab.url));
  }));
}

export = BadBehaviourMonitor