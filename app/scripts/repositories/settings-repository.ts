'use strict';

import ko = require('knockout');
import _ = require('lodash');
import SynchronizedObservable = require('synchronized-observable');
import Domain = require('url-monitoring/domain');

class SettingsRepository {
  public badDomains: KnockoutComputed<Array<Domain>>;

  constructor() {
    var syncedValues = {
      "badDomainPatterns": SynchronizedObservable("badDomainPatterns", [], "sync")
    };

    this.badDomains = ko.computed({
      read: function () {
        return _(syncedValues.badDomainPatterns()).map(function (pattern) {
          return new Domain(pattern);
        }).sortBy(function (domain) {
          return domain.toString();
        }).valueOf();
      },
      write: function (newDomains) {
        var patterns = _.map(newDomains, 'pattern');
        syncedValues.badDomainPatterns(patterns);
      }
    });
  }
}

export = SettingsRepository;