'use strict';

(function () {
  window.document.body.style.display = "none";
  window.location.href = chrome.extension.getURL("pomodoro-failed.html");
}());