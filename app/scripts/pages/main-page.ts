'use strict';

import Rollbar = require("rollbar");
Rollbar.enable();

import ko = require('knockout');
import Score = require('score');
import easeljs = require('createjs');

import tracking = require('tracking');
import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');

import SettingsRepository = require("repositories/settings-repository");
import TabMonitor = require("url-monitoring/tabs-monitor");
import BadBehaviourMonitor = require("url-monitoring/bad-behaviour-monitor");
import reportChromeErrors = require('report-chrome-errors');

import runTourIfRequired = require('pages/tour');

function getQueryParameter(name: string) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
}

function getDomainFromUrl(url: string): string {
  var matches = url.match(/^https?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i);
  var domain = matches && matches[1];
  return domain;
}

function closeThisTab() {
  chrome.tabs.query({currentWindow: true}, function (tabs) {
    // Only close this tab if there are other tabs in the window.
    if (tabs.length > 1) {
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id);
      });
    }
  });
}

enum OverlayType {
  PomodoroOverlay,
  BreakOverlay
}

class MainPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private score = new Score();
  private cityRenderer = new CityRenderer(this.score.city);
  private settings = new SettingsRepository();
  private badBehaviourMonitor = new BadBehaviourMonitor(new TabMonitor().allTabs, this.settings);

  constructor() {
    this.pomodoroActive.subscribe((newValue) => {
      if (newValue === false) this.warningPopupTriggered(false)
    });
  }

  failed = (getQueryParameter("failed") === "true");
  failingUrl = getQueryParameter("failingUrl");
  failingDomain = ko.pureComputed(() => this.failingUrl ? getDomainFromUrl(this.failingUrl) : null);

  private breakActive = this.pomodoroService.isBreakActive;
  private pomodoroActive = this.pomodoroService.isActive;

  timeRemaining = this.pomodoroService.timeRemaining;

  private overlayType = ko.pureComputed(() => {
    if (this.pomodoroActive()) {
      return OverlayType.PomodoroOverlay;
    } else if (this.breakActive()) {
      return OverlayType.BreakOverlay;
    } else {
      return null;
    }
  });

  overlayStyle = ko.pureComputed(() => {
    return {
      [OverlayType.PomodoroOverlay]: "pomodoro-overlay",
      [OverlayType.BreakOverlay]: "break-overlay"
    }[this.overlayType()];
  });
  overlayText = ko.pureComputed(() => {
    return {
      [OverlayType.PomodoroOverlay]: "Focusing",
      [OverlayType.BreakOverlay]: "On a break"
    }[this.overlayType()];
  });
  overlayShown = ko.pureComputed(() => this.overlayType() !== null);

  canStartPomodoro = ko.pureComputed(() => !this.pomodoroActive());
  canStartBreak = ko.pureComputed(() => !this.pomodoroActive() &&
                                        !this.breakActive());
  canSayNotNow = ko.pureComputed(() => !this.pomodoroActive() &&
                                       !this.breakActive());

  private warningPopupTriggered = ko.observable(false);
  warningPopupShown = ko.computed<Boolean>(() => {
    if (this.warningPopupTriggered() &&
        this.badBehaviourMonitor.currentBadTabs().length > 0) {
      return true;
    } else {
      // Turns itself off completely if it was triggered, but is now invalid.
      this.warningPopupTriggered(false);
      return false;
    }
  });

  closeDistractingTabs() {
    this.warningPopupTriggered(false);
    var tabsToRemove = this.badBehaviourMonitor.currentBadTabs();
    chrome.tabs.remove(tabsToRemove.map((t) => t.id), () => reportChromeErrors);
    closeThisTab();
  }

  leaveDistractingTabs() {
    this.warningPopupTriggered(false);
  }

  startPomodoro() {
    this.pomodoroService.start();
    tracking.trackEvent("start-from-main-page");
    if (this.badBehaviourMonitor.currentBadTabs().length === 0) {
      closeThisTab();
    } else {
      this.warningPopupTriggered(true);
    }
  }

  startBreak() {
    this.pomodoroService.takeABreak();
    tracking.trackEvent("start-break-from-main-page");

    if (this.failingUrl) {
      window.location.href = this.failingUrl;
    } else {
      closeThisTab();
    }
  }

  notNow() {
    closeThisTab();
  }

  onPageLoaded() {
    runTourIfRequired();
  }

  renderCity = () => this.cityRenderer.render();
}

export = MainPageViewModel;