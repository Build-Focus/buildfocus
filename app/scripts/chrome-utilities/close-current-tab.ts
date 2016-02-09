export = function closeCurrentTab(): void {
  chrome.tabs.query({currentWindow: true}, function (tabs) {
    // Only close this tab if there are other tabs in the window.
    if (tabs.length > 1) {
      chrome.tabs.getCurrent(function (tab) {
        chrome.tabs.remove(tab.id);
      });
    }
  });
};