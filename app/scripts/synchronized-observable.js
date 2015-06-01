'use strict';

define(["knockout", "lodash"], function (ko, _) {
  return function SynchronizedObservable(valueName) {
    var observable = ko.observable();

    chrome.storage.local.get(valueName, function (loadedData) {
      _.forEach(loadedData, function (value, key) {
        if (key === valueName) {
          observable(value);
        }
      });
    });

    observable.subscribe(function (newValue) {
      var changes = {};
      changes[valueName] = newValue;
      chrome.storage.local.set(changes);
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