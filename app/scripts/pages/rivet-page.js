'use strict';

define(["score"], function (score) {
  function getQueryParameter(name) {
    var match = new RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
  }

  function closeThisTab() {
    chrome.tabs.query({currentWindow: true}, function (tabs) {
      // Don't close this tab if it's the only tab in the window. // TODO: ADD TESTS FOR THIS
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
  };
});