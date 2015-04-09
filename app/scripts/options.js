'use strict';

(function() {
  var SettingsViewModel = function () {
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

    chrome.storage.sync.get("badDomains", function(storedData) {
      self.badDomains(storedData.badDomains || []);
    });

    self.badDomains.subscribe(function (badDomains) {
      chrome.storage.sync.set({"badDomains": badDomains});
    });
  };

  var viewModel = new SettingsViewModel();

  ko.applyBindings(viewModel);
}());
