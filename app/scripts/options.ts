'use strict';

require(["knockout", "lodash", "repositories/settings-repository", "url-monitoring/domain"],
  function (ko, _, SettingsRepository, Domain) {
    function OptionsViewModel() {
      var self = this;

      var settings = new SettingsRepository();
      self.badDomains = settings.badDomains;

      self.enteredBadDomainPattern = ko.observable("");
      self.enteredBadDomain = ko.computed(function () {
        return new Domain(self.enteredBadDomainPattern());
      });

      self.saveEnteredBadDomain = function () {
        self.badDomains(self.badDomains().concat(self.enteredBadDomain()));
        self.enteredBadDomainPattern("");
      };

      self.deleteBadDomain = function (badDomain) {
        self.badDomains(_.reject(self.badDomains(), badDomain));
      };
    }

    ko.applyBindings(new OptionsViewModel());
  }
);