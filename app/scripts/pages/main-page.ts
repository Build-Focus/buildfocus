'use strict';

import Rollbar = require("rollbar");
Rollbar.enable();

import ko = require('knockout');
import Score = require('score');
import easeljs = require('createjs');

import tracking = require('tracking');
import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');

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

class MainPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private score = new Score();
  private cityRenderer = new CityRenderer(this.score.city);

  failed = (getQueryParameter("failed") === "true");
  failingUrl = getQueryParameter("failingUrl");
  failingDomain = ko.computed(() => this.failingUrl ? getDomainFromUrl(this.failingUrl) : null);

  canStartPomodoro = ko.computed(() => !this.pomodoroService.isActive());

  canStartBreak = ko.computed(() => !this.pomodoroService.isActive() &&
                                    !this.pomodoroService.isBreakActive());

  canSayNotNow = ko.computed(() => !this.pomodoroService.isActive() &&
                                   !this.pomodoroService.isBreakActive());

  startPomodoro() {
    this.pomodoroService.start();
    tracking.trackEvent("start-from-main-page");
    closeThisTab();
  }

  startBreak() {
    this.pomodoroService.takeABreak();

    if (this.failingUrl) {
      window.location.href = this.failingUrl;
    } else {
      closeThisTab();
    }
  }

  notNow() {
    closeThisTab();
  }

  renderCity = () => this.cityRenderer.render();
}

export = MainPageViewModel;