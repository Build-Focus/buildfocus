'use strict';

import rollbar = require('rollbar');
import ko = require('knockout');
import Score = require('score');
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

class MainPageViewModel {
  private pomodoroService = new ProxyPomodoroService();
  private score = new Score();
  private cityRenderer = new CityRenderer(this.score.city);

  failed = (getQueryParameter("failed") === "true");

  canStartPomodoro = ko.computed(() => !this.pomodoroService.isActive());

  canStartBreak = ko.computed(() => !this.pomodoroService.isActive() &&
                                    !this.pomodoroService.isBreakActive());

  canSayNotNow = ko.computed(() => !this.pomodoroService.isActive() &&
                                   !this.pomodoroService.isBreakActive());

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

  renderCity = () => this.cityRenderer.render();
}

export = MainPageViewModel;