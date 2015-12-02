'use strict';

import Rollbar = require("rollbar");
Rollbar.enable();

import ko = require('knockout');
import score = require('score');

import SettingsRepository = require('repositories/settings-repository');
import Domain = require("url-monitoring/domain");

// TODO: Put this somewhere sensible. ...Maybe in a binding?
import runTourIfRequired = require('pages/tour');
runTourIfRequired();

export = function OptionsPageViewModel() {
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