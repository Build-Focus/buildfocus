'use strict';

(function () {
  function clearPageAndLeave() {
    var htmlTag = window.document.getElementsByTagName("html")[0];
    htmlTag.style.display = "none";
    htmlTag.innerHTML = "";

    window.location.href = chrome.extension.getURL("main.html?failed=true");
  }

  clearPageAndLeave();

  // Sometimes we have to fight scripts that are still running while this happens.
  // Try a few times, to force our way past that problem
  setTimeout(clearPageAndLeave, 100);
  setTimeout(clearPageAndLeave, 500);
  setTimeout(clearPageAndLeave, 1000);
}());