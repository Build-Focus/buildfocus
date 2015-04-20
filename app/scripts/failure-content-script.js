'use strict';

(function () {
  var htmlTag = window.document.getElementsByTagName("html")[0];
  htmlTag.style.display = "none";

  window.location.href = chrome.extension.getURL("pomodoro-failed.html");
}());