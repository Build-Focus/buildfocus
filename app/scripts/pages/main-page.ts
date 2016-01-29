'use strict';

import Rollbar = require("rollbar");
Rollbar.enable();

import ko = require('knockout');
import Score = require('score');
import easeljs = require('createjs');

import tracking = require('tracking');
import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');

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
    tracking.trackEvent("start-from-main-page");
    closeThisTab();
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