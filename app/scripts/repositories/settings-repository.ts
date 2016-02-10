'use strict';

import ko = require('knockout');
import _ = require('lodash');
import synchronizedObservable = require('observables/synchronized-observable');
import Domain = require('url-monitoring/domain');
import BadTabsWarningAction = require('components/bad-tabs-warning/bad-tabs-warning-action');

class SettingsRepository {
  private badDomainPatterns = synchronizedObservable("badDomainPatterns", [], "sync");

  public badDomains = ko.pureComputed({
    read: () => {
      return _(this.badDomainPatterns()).map(function (pattern) {
        return new Domain(pattern);
      }).sortBy(function (domain) {
        return domain.toString();
      }).valueOf();
    },
    write: (newDomains) => {
      var patterns = _.map(newDomains, 'pattern');
      this.badDomainPatterns(patterns);
    }
  });

  public badTabsWarningAction = synchronizedObservable("badTabsWarningAction", BadTabsWarningAction.Prompt, "sync");
}

export = SettingsRepository;