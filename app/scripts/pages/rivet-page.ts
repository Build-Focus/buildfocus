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

  public points = score.points;
  public failed = (getQueryParameter("failed") === "true");

  public canStartPomodoro: KnockoutComputed<boolean>;
  public canStartBreak: KnockoutComputed<boolean>;
  public canSayNotNow: KnockoutComputed<boolean>;

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

  public startPomodoro() {
    this.pomodoroService.start();
    closeThisTab();
  }

  public startBreak() {
    this.pomodoroService.takeABreak();
    closeThisTab();
  }

  public notNow() {
    closeThisTab();
  }

  public renderScore = (stage) => this.cityRenderer.render(stage);
}

export = RivetPageViewModel;