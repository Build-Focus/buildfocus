'use strict';

import ko = require('knockout');
import _ = require('lodash');
import reportChromeErrors = require('report-chrome-errors');

export = function synchronizedObservable<T>(valueName: string, initialValue: T = undefined, storageArea = "local"): KnockoutObservable<T> {
  var observable: KnockoutObservable<T> = ko.observable(initialValue)
                                            .extend({notify: 'always'}); // Required to stop some races

  // We don't want to send changes back to Chrome if we just got them from Chrome, or
  // we get some painful races and potential ABA cycles
  var currentlyUpdatingFromSync = false;

  chrome.storage[storageArea].get(valueName, function (loadedData) {
    reportChromeErrors("Failed to read from chrome storage");

    _.forEach(loadedData, function (value, key) {
      if (key === valueName) {
        currentlyUpdatingFromSync = true;
        observable(<T> value);
        currentlyUpdatingFromSync = false;
      }
    });
  });

  observable.subscribe(function (newValue) {
    if (!currentlyUpdatingFromSync) {
      var changes = {};
      changes[valueName] = newValue;
      chrome.storage[storageArea].set(changes, () => reportChromeErrors("Failed to store sync'd observable data"));
    }
  });

  chrome.storage.onChanged.addListener(function (changes: any) {
    reportChromeErrors("Failed to get chrome storage changes");

    _.forEach(changes, function (change: chrome.storage.StorageChange, key) {
      if (key === valueName) {
        currentlyUpdatingFromSync = true;
        observable(change.newValue);
        currentlyUpdatingFromSync = false;
      }
    });
  });

  return observable;
}