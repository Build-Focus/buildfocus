'use strict';

define(["knockout", "lodash", "models/domain"], function (ko, _, Domain) {
  function SettingsRepository() {
    var syncedValues = {
      "badDomainPatterns": ko.observableArray([])
    };

    chrome.storage.sync.get(_.keys(syncedValues), function (loadedData) {
      _.forEach(loadedData, function (value, key) {
        if (_.has(syncedValues, key)) {
          syncedValues[key](value);
        }
      });
    });

    chrome.storage.onChanged.addListener(function (changes) {
      _.forEach(changes, function (change, key) {
        if (_.has(syncedValues, key)) {
          syncedValues[key](change.newValue);
        }
      });
    });

    _.forEach(syncedValues, function(observable, key) {
      observable.subscribe(function (newValue) {
        var changes = {};
        changes[key] = newValue;
        chrome.storage.sync.set(changes);
      });
    });

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
});