'use strict';

define(["knockout", "lodash"], function (ko, _) {
  return function SubscribedObservable(valueName, initialValue, storageArea) {
    storageArea = storageArea || "local";

    var observable = ko.observable(initialValue);

    chrome.storage[storageArea].get(valueName, function (loadedData) {
      _.forEach(loadedData, function (value, key) {
        if (key === valueName) {
          observable(value);
        }
      });
    });

    chrome.storage.onChanged.addListener(function (changes) {
      _.forEach(changes, function (change, key) {
        if (key === valueName) {
          observable(change.newValue);
        }
      });
    });

    // Making this computed makes it readonly (it essentially is computed: it's computed somewhere else)
    return ko.computed(observable);
  };
});