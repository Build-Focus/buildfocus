export function showMainPage() {
  chrome.tabs.create({url: chrome.extension.getURL("main.html")});
}

export function showFailurePage() {
  chrome.tabs.create({url: chrome.extension.getURL("main.html?failed=true")});
}
