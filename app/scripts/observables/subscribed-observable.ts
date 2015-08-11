'use strict';

import ko = require("knockout");
import _ = require("lodash");

export = function subscribedObservable<T>(valueName: string, initialValue: T = undefined, storageArea = "local"): KnockoutComputed<T> {
  var observable: KnockoutObservable<T> = ko.observable(initialValue);

  chrome.storage[storageArea].get(valueName, function (loadedData) {
    _.forEach(loadedData, function (value, key) {
      if (key === valueName) {
        observable(<T> value);
      }
    });
  });

  chrome.storage.onChanged.addListener(function (changes) {
    _.forEach(changes, function (change: chrome.storage.StorageChange, key) {
      if (key === valueName) {
        observable(change.newValue);
      }
    });
  });

  // Making this computed makes it readonly (it essentially is computed: it's computed somewhere else)
  return ko.computed(<() => T> observable);
};