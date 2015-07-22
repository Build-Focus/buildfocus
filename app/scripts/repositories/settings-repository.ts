'use strict';

import ko = require('knockout');
import _ = require('lodash');
import SynchronizedObservable = require('observables/synchronized-observable');
import Domain = require('url-monitoring/domain');

class SettingsRepository {
  private syncedValues = {
    "badDomainPatterns": SynchronizedObservable("badDomainPatterns", [], "sync")
  };

  public badDomains = ko.pureComputed({
    read: () => {
      return _(this.syncedValues.badDomainPatterns()).map(function (pattern) {
        return new Domain(pattern);
      }).sortBy(function (domain) {
        return domain.toString();
      }).valueOf();
    },
    write: (newDomains) => {
      var patterns = _.map(newDomains, 'pattern');
      this.syncedValues.badDomainPatterns(patterns);
    }
  });
}

export = SettingsRepository;