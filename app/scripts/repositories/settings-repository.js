'use strict';

define(["knockout", "lodash", "synchronized-observable", "url-monitoring/domain"],
  function (ko, _, SynchronizedObservable, Domain) {
    function SettingsRepository() {
      var syncedValues = {
        "badDomainPatterns": new SynchronizedObservable("badDomainPatterns", [], "sync")
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

    return new SettingsRepository();
  }
);