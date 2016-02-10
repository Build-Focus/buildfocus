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
  allBadTabsWarningActions = Object.keys(BadTabsWarningAction)
                                   .map(v => parseInt(v, 10))
                                   .filter(v => !isNaN(v));

  getBadTabsWarningActionName(badTabsAction: BadTabsWarningAction) {
    return {
      [BadTabsWarningAction.Prompt]: "Warn you",
      [BadTabsWarningAction.CloseThem]: "Close them automatically",
      [BadTabsWarningAction.LeaveThem]: "Leave them open (be careful!)",
    }[badTabsAction];
  }


  onPageLoaded() {
    runTourIfRequired();
  }
}

export = OptionsPageViewModel;