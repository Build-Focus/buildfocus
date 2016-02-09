import rollbar = require('rollbar');

export = function reportChromeErrors(msg: string = "Error"): boolean {
  if (chrome.runtime.lastError) {
    rollbar.error(msg, {chromeError: chrome.runtime.lastError.message});
    return true;
  } else {
    return false;
  }
}