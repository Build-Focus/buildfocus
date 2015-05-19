'use strict';

define(["score"], function (score) {
  return function FailedPageViewModel() {
    this.points = score.points;

    this.startPomodoro = function () {
      chrome.extension.sendMessage({"action": "start-pomodoro"});
    };

    this.startBreak = function () {
      chrome.extension.sendMessage({"action": "start-break"});
    };
  };
});