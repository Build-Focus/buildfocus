'use strict';

define(["score"], function (score) {
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

  return function RivetPageViewModel() {
    this.points = score.points;

    this.failed = (getQueryParameter("failed") === "true");

    this.startPomodoro = function () {
      chrome.extension.sendMessage({"action": "start-pomodoro"});
      closeThisTab();
    };

    this.startBreak = function () {
      chrome.extension.sendMessage({"action": "start-break"});
      closeThisTab();
    };

    this.notNow = function () {
      closeThisTab();
    }
  };
});