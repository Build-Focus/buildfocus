'use strict';

require(["knockout", "lodash", "models/domain"], function (ko, _, Domain) {
  function OptionsViewModel() {
    var self = this;

    self.badDomains = ko.observableArray([]);
    self.enteredBadDomainPattern = ko.observable("");
    self.enteredBadDomain = ko.computed(function () {
      return new Domain(self.enteredBadDomainPattern());
    });

    self.saveEnteredBadDomain = function () {
      self.badDomains.push(self.enteredBadDomain());
      self.enteredBadDomainPattern("");
    };

    self.deleteBadDomain = function (badDomain) {
      self.badDomains(_.reject(self.badDomains(), badDomain));
    };

    chrome.storage.sync.get("badDomainPatterns", function (storedData) {
      var badDomainPatterns = storedData.badDomainPatterns || [];
      self.badDomains(_.map(badDomainPatterns, function (pattern) {
        return new Domain(pattern);
      }));
    });

    self.badDomains.subscribe(function (badDomains) {
      chrome.storage.sync.set({"badDomainPatterns": _.map(badDomains, "pattern")});
    });
  }

  ko.applyBindings(new OptionsViewModel());
});