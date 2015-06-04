'use strict';

define(["knockout", "lodash"], function (ko, _) {
  return function SynchronizedObservable(valueName, initialValue, storageArea) {
    storageArea = storageArea || "local";

    var observable = ko.observable(initialValue)
                       .extend({notify: 'always'}); // Required to stop some races

    // We don't want to send changes back to Chrome if we just got them from Chrome, or
    // we get some painful races and potential ABA cycles
    var currentlyUpdatingFromSync = false;

    chrome.storage[storageArea].get(valueName, function (loadedData) {
      _.forEach(loadedData, function (value, key) {
        if (key === valueName) {
          currentlyUpdatingFromSync = true;
          observable(value);
          currentlyUpdatingFromSync = false;
        }
      });
    });

    observable.subscribe(function (newValue) {
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