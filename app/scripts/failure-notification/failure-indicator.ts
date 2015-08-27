import _ = require("lodash");

const INJECTION_TIMEOUT = 1500;

function injectScript(tabId: number, onSuccess: () => void, onError: (e: string) => void) {
  chrome.tabs.executeScript(tabId, {
    file: "scripts/failure-notification/failure-content-script.js",
    runAt: "document_start"
  }, () => {
    if (chrome.runtime.lastError) onError(chrome.runtime.lastError.message);
    else onSuccess();
  });
}

function repeatedlyRetryInjection(tabId: number) {
  var startTimestamp = Date.now();

  var repeatInjectionInterval = setInterval(function () {
    injectScript(tabId, () => {
      console.info("Eventually successfully injected failure indication");
      clearInterval(repeatInjectionInterval);
    }, () => {
      if (Date.now() - startTimestamp >= INJECTION_TIMEOUT) {
        clearInterval(repeatInjectionInterval);
        giveUpOnInjection();
      }
    });
  }, 250);
}

function giveUpOnInjection() {
  console.warn(`Failed to inject within ${INJECTION_TIMEOUT}, opening new tab instead`);
  chrome.tabs.create({
    url: chrome.extension.getURL("main.html?failed=true"),
    active: true
  });
}

export = function indicateFailure(tabId: number) {
  injectScript(tabId, () => {
    console.info("Successfully injected failure indication");
  }, (e) => {
    console.warn(`Failed to inject initial script into tab ${tabId}: ${e}`);
    repeatedlyRetryInjection(tabId);
  });
}