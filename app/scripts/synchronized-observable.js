'use strict';

define(["knockout", "lodash"], function (ko, _) {
  return function SynchronizedObservable(valueName, initialValue, storageArea) {
    storageArea = storageArea || "local";
    var observable = ko.observable(initialValue);

    chrome.storage[storageArea].get(valueName, function (loadedData) {
      _.forEach(loadedData, function (value, key) {
        if (key === valueName) {
          observable(value);
        }
      });
    });

    observable.subscribe(function (newValue) {
      var changes = {};
      changes[valueName] = newValue;
      chrome.storage[storageArea].set(changes);
    });

    chrome.storage.onChanged.addListener(function (changes) {
      _.forEach(changes, function (change, key) {
        if (key === valueName) {
          observable(change.newValue);
        }
      });
    });

    return observable;
  };
});