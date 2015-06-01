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

    var currentlyUpdatingFromSync = false;

    observable.subscribe(function (newValue) {
      // We don't want to save things back for chrome if we just got them from chrome, or
      // we get some painful races and potential ABA cycles
      if (!currentlyUpdatingFromSync) {
        var changes = {};
        changes[valueName] = newValue;
        chrome.storage[storageArea].set(changes);
      }
    });

    chrome.storage.onChanged.addListener(function (changes) {
      _.forEach(changes, function (change, key) {
        if (key === valueName) {
          currentlyUpdatingFromSync = true;
          observable(change.newValue);
          currentlyUpdatingFromSync = false;
        }
      });
    });

    return observable;
  };
});