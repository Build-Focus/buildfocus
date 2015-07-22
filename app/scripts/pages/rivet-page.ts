'use strict';

import rollbar = require('rollbar');
import ko = require('knockout');
import score = require('score');
import easeljs = require('createjs');

import ProxyPomodoroService = require('pomodoro/proxy-pomodoro-service');
import CityRenderer = require('city/rendering/city-renderer');

function getQueryParameter(name) {
  var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
  return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
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

class RivetPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private cityRenderer = new CityRenderer(score.city);

  points = score.points;
  failed = (getQueryParameter("failed") === "true");

  canStartPomodoro: KnockoutComputed<boolean>;
  canStartBreak: KnockoutComputed<boolean>;
  canSayNotNow: KnockoutComputed<boolean>;

  constructor() {
    this.canStartPomodoro = ko.computed(() => {
      return !this.pomodoroService.isActive();
    });

    this.canStartBreak = ko.computed(() => {
      return !this.pomodoroService.isActive() && !this.pomodoroService.isBreakActive();
    });

    this.canSayNotNow = ko.computed(() => {
      return !this.pomodoroService.isActive() && !this.pomodoroService.isBreakActive();
    });
  }

  startPomodoro() {
    this.pomodoroService.start();
    closeThisTab();
  }

  startBreak() {
    this.pomodoroService.takeABreak();
    closeThisTab();
  }

  notNow() {
    closeThisTab();
  }

  renderScore = (stage) => this.cityRenderer.render(stage);
}

export = RivetPageViewModel;