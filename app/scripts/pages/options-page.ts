'use strict';

import Rollbar = require("rollbar");
Rollbar.enable();

import ko = require('knockout');
import score = require('score');

import SettingsRepository = require('repositories/settings-repository');
import Domain = require("url-monitoring/domain");
import runTourIfRequired = require('pages/tour');

class OptionsPageViewModel {
  private settings = new SettingsRepository();

  badDomains = this.settings.badDomains;
  enteredBadDomainPattern = ko.observable("");

  private enteredBadDomain = ko.computed(() => new Domain(this.enteredBadDomainPattern()));
  canSaveEnteredBadDomain = ko.computed(() => this.enteredBadDomain().isValid);

  saveEnteredBadDomain = () => {
    this.badDomains(this.badDomains().concat(this.enteredBadDomain()));
    this.enteredBadDomainPattern("");
  };

  deleteBadDomain = (badDomain: Domain) => {
    this.badDomains(_.reject(this.badDomains(), badDomain));
  };

  onPageLoaded() {
    runTourIfRequired();
  }
}

export = OptionsPageViewModel;