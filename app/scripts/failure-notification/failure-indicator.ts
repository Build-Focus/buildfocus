import _ = require("lodash");

const FAILURE_PAGE = chrome.extension.getURL("main.html?failed=true")

function showFailureInPage(tabId: number, onSuccess: () => void, onError: (e: string) => void) {
  chrome.tabs.update(tabId, {url: FAILURE_PAGE, active: true}, () => {
    if (chrome.runtime.lastError) {
      onError(chrome.runtime.lastError.message);
    } else {
      setTimeout(() => checkFailureInjectionWorked(tabId, onSuccess, onError), 100);
    }
  });
}

function checkFailureInjectionWorked(tabId: number, onSuccess: () => void, onError: (e: string) => void) {
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError !== undefined) {
      onError("Couldn't get details of updated tab after update");
    } else if (!_.contains(tab.url, 'main.html?failed=true')) {
      onError("Tab not showing updated URL, instead showing: " + tab.url);
    } else {
      onSuccess();
    }
  });
}

function showNewFailureTab() {
  chrome.tabs.create({
    url: chrome.extension.getURL("main.html?failed=true"),
    active: true
  });
}

export = function indicateFailure(tabId: number) {
  showFailureInPage(tabId, () => {
    console.info("Successfully showed failure indication");
  }, (e) => {
    console.warn(`Failed to show failure in tab ${tabId}: ${e}`);
    showNewFailureTab();
  });
}