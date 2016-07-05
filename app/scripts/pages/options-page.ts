'use strict';

import ko = require('knockout');
import score = require('score');

import SettingsRepository = require('settings-repository');
import Domain = require("url-monitoring/domain");
import runTourIfRequired = require('ui-components/tour');

import BadTabsWarningAction = require('bad-tabs-warning/bad-tabs-warning-action');
import AutopauseMode = require("idle-monitoring/autopause-mode");

import tracking = require('tracking/tracking');

function enumSelection<T>(enumToUse: T, idToStringMap: {[id: number]: string}): {id: number, name: string}[] {
  return Object.keys(enumToUse)
    .map(actionKey => parseInt(actionKey, 10))
    .filter(actionKey => !isNaN(actionKey))
    .map(actionKey => { return {
      id: actionKey,
      name: idToStringMap[actionKey]
    }});
}

class OptionsPageViewModel {
  private settings = new SettingsRepository();

  badDomains = this.settings.badDomains;
  enteredBadDomainPattern = ko.observable("");

  private enteredBadDomain = ko.computed(() => new Domain(this.enteredBadDomainPattern()));
  canSaveEnteredBadDomain = ko.computed(() => this.enteredBadDomain().isValid);

  saveEnteredBadDomain = () => {
    tracking.trackEvent("settings.add-bad-domain", {domain: this.enteredBadDomain()});

    this.badDomains(this.badDomains().concat(this.enteredBadDomain()));
    this.enteredBadDomainPattern("");
  };

  deleteBadDomain = (badDomain: Domain) => {
    tracking.trackEvent("settings.delete-bad-domain", {domain: badDomain.pattern});

    this.badDomains(_.reject(this.badDomains(), badDomain));
  };

  badTabsWarningAction = this.settings.badTabsWarningAction;

  allBadTabsWarningActions = enumSelection(BadTabsWarningAction, {
    [BadTabsWarningAction.Prompt]: "Ask you",
    [BadTabsWarningAction.CloseThem]: "Close them",
    [BadTabsWarningAction.LeaveThem]: "Leave them",
  });

  autopauseMode = this.settings.autopauseMode;

  autopauseModes = enumSelection(AutopauseMode, {
    [AutopauseMode.PauseOnIdleAndLock]: "Lock or idle",
    [AutopauseMode.PauseOnLock]: "Lock",
    [AutopauseMode.NeverPause]: "Never",
  });

  onPageLoaded() {
    runTourIfRequired();
  }
}

export = OptionsPageViewModel;
