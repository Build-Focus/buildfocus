'use strict';

import ko = require('knockout');
import score = require('score');

import SettingsRepository = require('repositories/settings-repository');
import Domain = require("url-monitoring/domain");
import runTourIfRequired = require('pages/tour');
import BadTabsWarningAction = require('components/bad-tabs-warning/bad-tabs-warning-action');

// TODO: Once this grows bigger, refactor sites list and other settings into standalone components.
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

  badTabsWarningAction = this.settings.badTabsWarningAction;

  private badTabsWarningActionNames = {
    [BadTabsWarningAction.Prompt]: "Ask you",
    [BadTabsWarningAction.CloseThem]: "Close them",
    [BadTabsWarningAction.LeaveThem]: "Leave them",
  };

  allBadTabsWarningActions = Object.keys(BadTabsWarningAction)
     .map(actionKey => parseInt(actionKey, 10))
     .filter(actionKey => !isNaN(actionKey))
     .map(actionKey => { return {
       id: actionKey,
       name: this.badTabsWarningActionNames[actionKey]
     }});

  onPageLoaded() {
    runTourIfRequired();
  }
}

export = OptionsPageViewModel;