'use strict';

import ko = require('knockout');
import Score = require('score');
import easeljs = require('createjs');

import tracking = require('tracking/tracking');
import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');
import TabsMonitor = require('url-monitoring/tabs-monitor');
import SettingsRepository = require("repositories/settings-repository");

import BadTabsWarningViewModel = require('components/bad-tabs-warning/bad-tabs-warning-viewmodel');

import closeCurrentTab = require("chrome-utilities/close-current-tab");
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

enum OverlayType {
  PomodoroOverlay,
  BreakOverlay
}

class MainPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private score = new Score();
  private cityRenderer = new CityRenderer(this.score.city);
  private settings = new SettingsRepository();

  warningPopup = new BadTabsWarningViewModel(this.pomodoroService, new TabsMonitor().allTabs, this.settings);

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

  startPomodoro() {
    this.pomodoroService.start();
    tracking.trackPageClosingEvent("start-from-main-page");
    if (this.warningPopup.shouldShowIfTriggered()) {
      this.warningPopup.trigger();
    } else {
      closeCurrentTab();
    }
  }

  startBreak() {
    this.pomodoroService.takeABreak();
    tracking.trackPageClosingEvent("start-break-from-main-page");

    if (this.failingUrl) {
      window.location.href = this.failingUrl;
    } else {
      closeCurrentTab();
    }
  }

  notNow() {
    closeCurrentTab();
  }

  onPageLoaded() {
    runTourIfRequired();
  }

  renderCity = () => this.cityRenderer.render();
}

export = MainPageViewModel;