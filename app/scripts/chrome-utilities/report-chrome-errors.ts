import rollbar = require('rollbar');

export = function reportChromeErrors(msg: string = "Error"): chrome.runtime.LastError {
  if (chrome.runtime.lastError) {
    rollbar.error(msg, {chromeError: chrome.runtime.lastError.message});
    return chrome.runtime.lastError;
  } else {
    return null;
  }
}
