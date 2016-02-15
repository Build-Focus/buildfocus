import reportChromeErrors = require('chrome-utilities/report-chrome-errors');

function isSet<T>(storage: chrome.storage.StorageArea, key: string, defaultValue: T): Promise<boolean> {
  return new Promise((resolve, reject) => {
    storage.get(key, function (data) {
      reportChromeErrors(`Failed to get store-once: '${key}'`);

      if (!data[key]) {
        var newValue = defaultValue;
        storage.set({[key]: newValue}, () => reportChromeErrors(`Failed to save store-once: '${key}'`));
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}

function get<T>(storage: chrome.storage.StorageArea, key: string, defaultValue: T): Promise<T> {
  return new Promise((resolve, reject) => {
    storage.get(key, function (data) {
      reportChromeErrors(`Failed to get store-once: '${key}'`);

      if (!data[key]) {
        var newValue = defaultValue;
        storage.set({[key]: newValue}, () => reportChromeErrors(`Failed to save store-once: '${key}'`));
        resolve(newValue);
      } else {
        resolve(data[key]);
      }
    });
  });
}

export function getLocally<T>(key: string, defaultValue: T): Promise<T> {
  return get(chrome.storage.local, key, defaultValue);
}

export function getSynced<T>(key: string, defaultValue: T): Promise<T> {
  return get(chrome.storage.sync, key, defaultValue);
}

export function isSetLocally<T>(key: string, defaultValue: T): Promise<boolean> {
  return isSet(chrome.storage.local, key, defaultValue);
}

export function isSetSynced<T>(key: string, defaultValue: T): Promise<boolean> {
  return isSet(chrome.storage.sync, key, defaultValue);
}