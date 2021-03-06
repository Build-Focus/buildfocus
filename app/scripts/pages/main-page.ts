///<amd-dependency path="metrics/metrics-panel-viewmodel" />
///<amd-dependency path="bad-tabs-warning/bad-tabs-warning-viewmodel" />

import ko = require('knockout');
import Score = require('score');
import easeljs = require('createjs');

import tracking = require('tracking/tracking');
import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');
import TabsMonitor = require('url-monitoring/tabs-monitor');
import SettingsRepository = require("settings-repository");
import generateCityName = require("city/generate-city-name");

import closeCurrentTab = require("chrome-utilities/close-current-tab");
import runTourIfRequired = require('ui-components/tour');

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
  PausedOverlay,
  BreakOverlay
}

class MainPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private score = new Score();
  private cityRenderer = new CityRenderer(this.score.city);
  private settings = new SettingsRepository();

  failed = (getQueryParameter("failed") === "true");
  failingUrl = getQueryParameter("failingUrl");
  failingDomain = ko.pureComputed(() => this.failingUrl ? getDomainFromUrl(this.failingUrl) : null);

  cityName = ko.pureComputed({
    read: () => this.score.city.name,
    write: (value) => {
      this.score.city.name = value;
      tracking.trackEvent("main-page.update-city-name", { name: value });
    }
  });

  randomizeCityName() {
    this.cityName(generateCityName());
    tracking.trackEvent("main-page.randomize-city-name", { name: this.cityName() });
  };

  private breakActive = this.pomodoroService.isBreakActive;
  private pomodoroActive = this.pomodoroService.isActive;
  private pomodoroPaused = this.pomodoroService.isPaused;
  private inactive = this.pomodoroService.isInactive;

  timeRemaining = this.pomodoroService.timeRemaining;

  private overlayType = ko.pureComputed(() => {
    if (this.pomodoroActive()) {
      return OverlayType.PomodoroOverlay;
    } else if (this.pomodoroPaused()) {
      return OverlayType.PausedOverlay;
    } else if (this.breakActive()) {
      return OverlayType.BreakOverlay;
    } else {
      return null;
    }
  });

  overlayStyle = ko.pureComputed(() => {
    return {
      [OverlayType.PomodoroOverlay]: "pomodoro-overlay",
      [OverlayType.PausedOverlay]:   "pomodoro-overlay",
      [OverlayType.BreakOverlay]:    "break-overlay"
    }[this.overlayType()];
  });
  overlayText = ko.pureComputed(() => {
    return {
      [OverlayType.PomodoroOverlay]: "Focusing",
      [OverlayType.PausedOverlay]:   "Paused",
      [OverlayType.BreakOverlay]:    "On a break"
    }[this.overlayType()];
  });
  overlayShown = ko.pureComputed(() => this.overlayType() !== null);

  canStartPomodoro = ko.pureComputed(() => this.inactive() || this.breakActive());
  canStartBreak    = ko.pureComputed(() => this.inactive());
  canSayNotNow     = ko.pureComputed(() => this.inactive());

  startPomodoro() {
    this.pomodoroService.start().then((stayOpen) => {
      if (!stayOpen) closeCurrentTab();
    });

    tracking.trackEvent("start-from-main-page");
  }

  startBreak() {
    this.pomodoroService.takeABreak();

    if (this.failingUrl) {
      tracking.trackEvent("start-break-from-main-page");
      window.location.href = this.failingUrl;
    } else {
      tracking.trackEvent("start-break-from-main-page").then(() => closeCurrentTab());
    }
  }

  notNow() {
    tracking.trackEvent("not-now").then(() => closeCurrentTab());
  }

  onPageLoaded() {
    runTourIfRequired();
  }

  renderCity = () => this.cityRenderer.render();
}

export = MainPageViewModel;
